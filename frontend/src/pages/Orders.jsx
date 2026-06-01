import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getOrders, createOrder, deleteOrder, getProducts, getCustomers } from '../services/api';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ customer_id: '', items: [{ product_id: '', quantity: 1 }] });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        getOrders(),
        getProducts(),
        getCustomers(),
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setCustomers(customersRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      customer_id: parseInt(form.customer_id),
      items: form.items
        .filter((item) => item.product_id && item.quantity > 0)
        .map((item) => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
        })),
    };

    if (payload.items.length === 0) {
      toast.error('Add at least one item to the order');
      return;
    }

    try {
      await createOrder(payload);
      toast.success('Order placed successfully');
      setShowModal(false);
      setForm({ customer_id: '', items: [{ product_id: '', quantity: 1 }] });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create order');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this order? Stock will be restored.')) return;
    try {
      await deleteOrder(id);
      toast.success('Order cancelled');
      loadData();
    } catch (err) {
      toast.error('Failed to cancel order');
    }
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { product_id: '', quantity: 1 }] });
  };

  const removeItem = (index) => {
    const updated = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: updated.length ? updated : [{ product_id: '', quantity: 1 }] });
  };

  const updateItem = (index, field, value) => {
    const updated = [...form.items];
    updated[index][field] = value;
    setForm({ ...form, items: updated });
  };

  const getCustomerName = (id) => {
    const c = customers.find((cust) => cust.id === id);
    return c ? c.name : `Customer #${id}`;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Orders</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Order</button>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>No orders yet. Place your first order to get started.</p>
        </div>
      ) : (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{getCustomerName(order.customer_id)}</td>
                  <td>{order.items.length} item(s)</td>
                  <td>${order.total_amount.toFixed(2)}</td>
                  <td><span className="status-badge">{order.status}</span></td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(order.id)}>
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>New Order</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Customer</label>
                <select
                  value={form.customer_id}
                  onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div className="order-items-section">
                <label style={{ marginBottom: '12px', display: 'block', fontWeight: '600' }}>
                  Order Items
                </label>
                {form.items.map((item, index) => (
                  <div key={index} className="order-item-row">
                    <select
                      value={item.product_id}
                      onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                      required
                    >
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Stock: {p.stock})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      placeholder="Qty"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeItem(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>
                  + Add Item
                </button>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Place Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
