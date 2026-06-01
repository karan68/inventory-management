from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Order, OrderItem, Product, Customer
from ..schemas import OrderCreate, OrderResponse

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.get("/", response_model=List[OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/", response_model=OrderResponse, status_code=201)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    # verify customer exists
    customer = db.query(Customer).filter(Customer.id == order_data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if not order_data.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")

    # validate stock availability for each item
    total = 0.0
    order_items = []

    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product with id {item.product_id} not found"
            )
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.stock}, Requested: {item.quantity}"
            )

        line_total = product.price * item.quantity
        total += line_total
        order_items.append({
            "product_id": item.product_id,
            "quantity": item.quantity,
            "unit_price": product.price
        })

    # create order
    order = Order(customer_id=order_data.customer_id, total_amount=round(total, 2))
    db.add(order)
    db.flush()

    # create order items and reduce stock
    for oi in order_items:
        db_item = OrderItem(order_id=order.id, **oi)
        db.add(db_item)

        # reduce product stock
        product = db.query(Product).filter(Product.id == oi["product_id"]).first()
        product.stock -= oi["quantity"]

    db.commit()
    db.refresh(order)
    return order


@router.delete("/{order_id}", status_code=204)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # restore stock when order is deleted
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.stock += item.quantity

    db.delete(order)
    db.commit()
    return None
