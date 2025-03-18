import React, { useEffect, useState } from 'react';
import axios from 'axios';

type Product = any;
type CartItem = any;

export const ProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, cartRes] = await Promise.all([
          axios.get('http://localhost:3001/api/products'),
          axios.get('http://localhost:3001/api/cart')
        ]);
        setProducts(productsRes.data);
        setCart(cartRes.data);
      } catch (err) {
        setError('Failed to fetch data');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredProducts = products
    .filter(product => 
      (filterCategory === 'all' || product.category === filterCategory) &&
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const handleAddToCart = async (product: Product) => {
    try {
      await axios.post('http://localhost:3001/api/cart', { productId: product.id });
      const existingItem = cart.find(item => item.productId === product.id);
      
      if (existingItem) {
        setCart(cart.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        setCart([...cart, { productId: product.id, quantity: 1 }]);
      }
    } catch (err) {
      setError('Failed to add to cart');
    }
  };

  return (
    <div>
      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products..."
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="price">Sort by Price</option>
          <option value="name">Sort by Name</option>
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
        </select>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {filteredProducts.map(product => (
          <div key={product.id} style={{ border: '1px solid #ccc', padding: '10px' }}>
            <img src={product.image} alt={product.name} style={{ width: '100%' }} />
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            <button onClick={() => handleAddToCart(product)}>Add to Cart</button>
          </div>
        ))}
      </div>

      <div>
        <h2>Shopping Cart</h2>
        {cart.map(item => {
          const product = products.find(p => p.id === item.productId);
          return product ? (
            <div key={item.productId}>
              <span>{product.name}</span>
              <span>Quantity: {item.quantity}</span>
              <span>Total: ${product.price * item.quantity}</span>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
};