document.addEventListener('DOMContentLoaded', function() {
    console.log('Website loaded successfully!');
    
    setupMobileNavigation();
    setupSearchAndFilter();
    setupScrollAnimations();
    setupShoppingCart();
    setupContactForm();
    setupAuthState();
    
    showWelcomeMessage();

    // Load products from backend API and render
    initializeBackendProductLoading();
});

function setupMobileNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

function setupSearchAndFilter() {
    const searchInput = document.getElementById('perfumeSearch');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('#perfumesGrid .product-card');
    
    let currentFilter = 'all';
    let currentSearch = '';
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentSearch = this.value.toLowerCase();
            filterProducts();
        });
    }
    
    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            filterProducts();
        });
    });
    
    function filterProducts() {
        let visibleCount = 0;
        
        const currentCards = document.querySelectorAll('#perfumesGrid .product-card');
        currentCards.forEach(card => {
            const productName = (card.getAttribute('data-name') || '').toLowerCase();
            const productType = card.getAttribute('data-type');
            
            const matchesSearch = currentSearch === '' || productName.includes(currentSearch);
            const matchesFilter = currentFilter === 'all' || productType === currentFilter;
            
            if (matchesSearch && matchesFilter) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });
        
        // Show no results message if needed
        showNoResultsMessage(visibleCount === 0);
    }
    
    function showNoResultsMessage(show) {
        let noResultsCard = document.querySelector('.no-results-card');
        
        if (show && !noResultsCard) {
            noResultsCard = document.createElement('div');
            noResultsCard.className = 'product-card no-results no-results-card';
            noResultsCard.innerHTML = `
                <i class="fas fa-search" style="font-size: 3rem; color: #d4af37; margin-bottom: 1rem;"></i>
                <h3>No products found</h3>
                <p>Try adjusting your search or filter criteria</p>
            `;
            document.getElementById('perfumesGrid').appendChild(noResultsCard);
        } else if (!show && noResultsCard) {
            noResultsCard.remove();
        }
    }
}

function setupScrollAnimations() {
    
    const animatedElements = document.querySelectorAll('.product-card, .feature, .section-title');

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
            
                entry.target.classList.add('fade-in', 'visible');
                
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease';
        observer.observe(element);
    });
}

function setupShoppingCart() {
    let cart = [];
    let cartTotal = 0;
    
    const cartSidebar = document.getElementById('cartSidebar');
    const cartItems = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    const cartCountElement = document.getElementById('cartCount');
    
    // Load cart from localStorage on initialization
    loadCartFromStorage();
    
    // Event delegation for dynamically added buttons
    document.addEventListener('click', function(e) {
        const target = e.target;
        if (target && target.classList && target.classList.contains('add-to-cart')) {
            const productCard = target.closest('.product-card');
            if (!productCard) return;
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = parseFloat(productCard.querySelector('.price').textContent.replace('₹', '').replace(/,/g, ''));
            const productDescription = productCard.querySelector('p').textContent;
            const productId = productCard.getAttribute('data-id') || null;
            const productImageEl = productCard.querySelector('img');
            const productImage = productImageEl ? productImageEl.getAttribute('src') : null;

            addToCart({ id: productId, name: productName, price: productPrice, description: productDescription, image: productImage });
            
            target.classList.add('success-animation');
            setTimeout(() => {
                target.classList.remove('success-animation');
            }, 600);
        }
    });
     
    function addToCart(item) {
        const key = item.id || item.name;
        const existingItem = cart.find(ci => (ci.id || ci.name) === key);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: item.id || null,
                name: item.name,
                price: item.price,
                description: item.description,
                image: item.image || null,
                quantity: 1
            });
        }
        updateCartDisplay();
        saveCartToStorage();
        
        showNotification(`${item.name} added to cart!`);
    }
     
    function updateCartDisplay() {
        cartItems.innerHTML = '';
        cartTotal = 0;
        let totalItems = 0;
        cart.forEach(item => {
            cartTotal += item.price * item.quantity;
            totalItems += item.quantity;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                        <button onclick="updateQuantity('${(item.id || item.name).toString().replace(/'/g, "\'")}', -1)" style="background: #d4af37; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">-</button>
                        <span>Qty: ${item.quantity}</span>
                        <button onclick="updateQuantity('${(item.id || item.name).toString().replace(/'/g, "\'")}', 1)" style="background: #d4af37; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">+</button>
                        <span style="margin-left: 10px; font-weight: bold;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                </div>
                <button onclick="removeFromCart('${(item.id || item.name).toString().replace(/'/g, "\'")}')" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Remove</button>
            `;
            cartItems.appendChild(cartItem);
        });
    
        cartTotalElement.textContent = cartTotal.toLocaleString('en-IN');
        cartCountElement.textContent = totalItems;
    }
 
    window.removeFromCart = function(key) {
        const itemIndex = cart.findIndex(item => (item.id || item.name) === key);
        if (itemIndex > -1) {
            cart.splice(itemIndex, 1);
            updateCartDisplay();
            saveCartToStorage();
            showNotification(`Item removed from cart!`);
        }
    };

    window.updateQuantity = function(key, change) {
        const itemIndex = cart.findIndex(item => (item.id || item.name) === key);
        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
            }
            updateCartDisplay();
            saveCartToStorage();
        }
    };

    function saveCartToStorage() {
        try {
            localStorage.setItem('alma_cart', JSON.stringify(cart));
        } catch (e) {
            console.warn('Could not save cart to localStorage:', e);
        }
    }

    function loadCartFromStorage() {
        try {
            const saved = localStorage.getItem('alma_cart');
            if (saved) {
                cart = JSON.parse(saved);
                updateCartDisplay();
            }
        } catch (e) {
            console.warn('Could not load cart from localStorage:', e);
            cart = [];
        }
    }
     
    window.toggleCart = function() {
        cartSidebar.classList.toggle('open');
    };
     
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async function() {
            if (cart.length === 0) {
                showNotification('Your cart is empty!', 'warning');
                return;
            }

            const itemsWithIds = cart
                .filter(ci => !!ci.id)
                .map(ci => ({ productId: ci.id, quantity: ci.quantity }));

            if (itemsWithIds.length === 0) {
                showNotification('Add items from the online catalog to checkout.', 'warning');
                return;
            }

            try {
                const API_BASE = localStorage.getItem('API_BASE') || `http://${window.location.hostname}:5000`;
                
                // Create Razorpay order
                const resp = await fetch(`${API_BASE}/api/orders/razorpay`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ items: itemsWithIds })
                });
                
                const data = await resp.json();
                if (!resp.ok) {
                    showNotification(data.message || 'Checkout failed', 'error');
                    return;
                }

                // Initialize Razorpay checkout
                const options = {
                    key: data.key,
                    amount: data.amount,
                    currency: data.currency,
                    name: 'Alma Cosmetics',
                    description: 'Order Payment',
                    order_id: data.razorpayOrderId,
                    handler: async function(response) {
                        try {
                            // Verify payment
                            const verifyResp = await fetch(`${API_BASE}/api/orders/razorpay/verify`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    orderId: data.orderId
                                })
                            });
                            
                            const verifyData = await verifyResp.json();
                            if (verifyResp.ok) {
                                showNotification('Payment successful! Order placed.', 'success');
                                cart = [];
                                updateCartDisplay();
                                saveCartToStorage();
                                toggleCart();
                            } else {
                                showNotification(verifyData.message || 'Payment verification failed', 'error');
                            }
                        } catch (err) {
                            showNotification('Payment verification error', 'error');
                        }
                    },
                    prefill: {
                        name: 'Customer',
                        email: 'customer@example.com',
                        contact: '9999999999'
                    },
                    theme: {
                        color: '#d4af37'
                    }
                };

                const rzp = new Razorpay(options);
                rzp.on('payment.failed', function(response) {
                    showNotification('Payment failed. Please try again.', 'error');
                });
                rzp.open();
                
            } catch (err) {
                showNotification('Checkout error occurred', 'error');
            }
        });
    }
}

function setupContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const name = contactForm.querySelector('input[type="text"]').value;
            const email = contactForm.querySelector('input[type="email"]').value;
            const message = contactForm.querySelector('textarea').value;
  
            if (!name || !email || !message) {
                showNotification('Please fill in all fields!', 'error');
                return;
            }
      
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<span class="loading"></span> Sending...';
            submitBtn.disabled = true;
         
            setTimeout(() => {
                showNotification('Message sent successfully!', 'success');
                contactForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
  
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;

    switch(type) {
        case 'success':
            notification.style.background = '#27ae60';
            break;
        case 'error':
            notification.style.background = '#e74c3c';
            break;
        case 'warning':
            notification.style.background = '#f39c12';
            break;
        default:
            notification.style.background = '#3498db';
    }
  
    document.body.appendChild(notification);
 
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
   
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});


window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(10, 10, 10, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Modal functionality
let currentModalProduct = null;

function openProductModal(productCard) {
    const modal = document.getElementById('productModal');
    const productName = productCard.querySelector('h3').textContent;
    const productDescription = productCard.querySelector('p').textContent;
    const productPrice = productCard.querySelector('.price').textContent;
    const productImage = productCard.querySelector('img').src;
    
    // Set modal content
    document.getElementById('modalProductName').textContent = productName;
    document.getElementById('modalProductDescription').textContent = productDescription;
    document.getElementById('modalProductPrice').textContent = productPrice;
    document.getElementById('modalProductImage').src = productImage;
    
    // Store current product info
    currentModalProduct = {
        name: productName,
        price: parseFloat(productPrice.replace('₹', '').replace(',', '')),
        description: productDescription,
        image: productImage
    };
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentModalProduct = null;
}

function decreaseQuantity() {
    const input = document.getElementById('quantityInput');
    if (input.value > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

function increaseQuantity() {
    const input = document.getElementById('quantityInput');
    input.value = parseInt(input.value) + 1;
}

function addToCartFromModal() {
    if (!currentModalProduct) return;
    
    const quantity = parseInt(document.getElementById('quantityInput').value);
    
    // Add to cart multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
        addToCart({ name: currentModalProduct.name, price: currentModalProduct.price, description: currentModalProduct.description, image: currentModalProduct.image });
    }
    
    closeProductModal();
    showNotification(`${quantity}x ${currentModalProduct.name} added to cart!`, 'success');
}

function buyNow() {
    if (!currentModalProduct) return;
    
    const quantity = parseInt(document.getElementById('quantityInput').value);
    
    // Add to cart and proceed to checkout
    for (let i = 0; i < quantity; i++) {
        addToCart({ name: currentModalProduct.name, price: currentModalProduct.price, description: currentModalProduct.description, image: currentModalProduct.image });
    }
    
    closeProductModal();
    toggleCart();
    showNotification('Proceeding to checkout...', 'success');
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('productModal');
    if (e.target === modal) {
        closeProductModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeProductModal();
    }
});

// Add quick view functionality to product cards
document.addEventListener('DOMContentLoaded', function() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        // Add click event for quick view (excluding add to cart button)
        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('add-to-cart')) {
                openProductModal(this);
            }
        });
        
        // Add hover effect for quick view indication
        card.style.cursor = 'pointer';
        card.title = 'Click to view details';
    });
});

// Performance optimizations and loading states
function showLoadingState(element) {
    element.innerHTML = '<div class="loading-spinner"></div>';
    element.disabled = true;
}

function hideLoadingState(element, originalContent) {
    element.innerHTML = originalContent;
    element.disabled = false;
}

// Lazy loading for images
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Enhanced search with debouncing
const debouncedSearch = debounce(function(searchTerm) {
    // Search logic here
    console.log('Searching for:', searchTerm);
}, 300);

// Safe welcome message (prevents runtime error if not defined)
function showWelcomeMessage() {
    try {
        if (sessionStorage.getItem('welcomeShown')) return;
        sessionStorage.setItem('welcomeShown', '1');
        // Optional: uncomment to show a toast once per session
        // showNotification('Welcome to Alma!', 'success');
    } catch (_) {
        // no-op
    }
}

// Backend integration: load products and render into perfumes grid
function initializeBackendProductLoading() {
    const perfumesGrid = document.getElementById('perfumesGrid');
    const cosmeticsGrid = document.getElementById('cosmeticsGrid');
    if (!perfumesGrid && !cosmeticsGrid) return;
    const primaryBase = localStorage.getItem('API_BASE') || `http://${window.location.hostname}:5000`;
    const fallbackBase = primaryBase.includes('localhost')
        ? primaryBase.replace('localhost', '127.0.0.1')
        : primaryBase.replace('127.0.0.1', 'localhost');

    // Show loading card
    const addLoading = (grid) => {
        if (!grid) return null;
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = '<div class="loading-spinner" style="margin: 20px auto;"></div>';
        grid.appendChild(card);
        return card;
    };
    const loadingPerfumes = addLoading(perfumesGrid);
    const loadingCosmetics = addLoading(cosmeticsGrid);

    const loadFrom = async (base) => {
        console.log('Loading products from:', base);
        const resp = await fetch(`${base}/api/products`);
        if (!resp.ok) throw new Error(`Failed ${resp.status}`);
        return resp.json();
    };

    loadFrom(primaryBase)
        .catch(() => loadFrom(fallbackBase))
        .then((products) => {
            if (!Array.isArray(products)) throw new Error('Invalid products payload');
            console.log('Products loaded:', products.length);
            // Clear grids
            if (perfumesGrid) perfumesGrid.innerHTML = '';
            if (cosmeticsGrid) cosmeticsGrid.innerHTML = '';
            const noResultsCard = document.querySelector('.no-results-card');
            if (noResultsCard) noResultsCard.remove();
            // Render by category: treat brand 'Cosmetic' as cosmetics section
            products.forEach(p => {
                const isCosmetic = (p.brand || '').toLowerCase() === 'cosmetic';
                const grid = isCosmetic ? cosmeticsGrid : perfumesGrid;
                if (!grid) return;
                const card = document.createElement('div');
                card.className = 'product-card';
                card.setAttribute('data-category', isCosmetic ? 'cosmetic' : 'perfume');
                card.setAttribute('data-type', (p.brand || 'floral').toLowerCase());
                card.setAttribute('data-name', p.name);
                card.setAttribute('data-id', p._id);
                const imgClass = isCosmetic ? 'cosmetic-img' : 'perfume-img';
                card.innerHTML = `
                    <div class="product-image">
                        <img src="${p.image}" alt="${p.name}" class="${imgClass}">
                    </div>
                    <h3>${p.name}</h3>
                    <p>${p.description}</p>
                    <span class="price">₹${Number(p.price).toLocaleString('en-IN')}</span>
                    <button class="add-to-cart">Add to Cart</button>
                `;
                grid.appendChild(card);
            });
        })
        .catch((err) => {
            console.error('Product load failed:', err);
            if (loadingPerfumes) loadingPerfumes.remove();
            if (loadingCosmetics) loadingCosmetics.remove();
            showNotification('Could not load products from server', 'warning');
        });
}

// Auth pages helpers
function setupAuthForms() {
    const API_BASE = localStorage.getItem('API_BASE') || 'http://localhost:5000';
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value.trim();
            try {
                const resp = await fetch(`${API_BASE}/api/users/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email, password })
                });
                const data = await resp.json();
                if (!resp.ok) throw new Error(data.message || 'Login failed');
                localStorage.setItem('user', JSON.stringify(data));
                showNotification('Logged in successfully', 'success');
                updateNavbarAuthState();
                window.location.href = 'index.html';
            } catch (err) {
                showNotification(err.message, 'error');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value.trim();
            try {
                const resp = await fetch(`${API_BASE}/api/users/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ name, email, password })
                });
                const data = await resp.json();
                if (!resp.ok) throw new Error(data.message || 'Registration failed');
                localStorage.setItem('user', JSON.stringify(data));
                showNotification('Account created', 'success');
                updateNavbarAuthState();
                window.location.href = 'index.html';
            } catch (err) {
                showNotification(err.message, 'error');
            }
        });
    }
}

// My Orders page
async function loadMyOrders() {
    const API_BASE = localStorage.getItem('API_BASE') || 'http://localhost:5000';
    const grid = document.getElementById('ordersGrid');
    if (!grid) return;
    try {
        const resp = await fetch(`${API_BASE}/api/orders/my`, { credentials: 'include' });
        const orders = await resp.json();
        if (!resp.ok) throw new Error(orders.message || 'Failed to load orders');
        grid.innerHTML = '';
        orders.forEach(o => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <h3>Order #${o._id}</h3>
                <p>Status: ${o.status}</p>
                <span class="price">₹${Number(o.totalPrice).toLocaleString('en-IN')}</span>
            `;
            grid.appendChild(card);
        });
    } catch (err) {
        showNotification(err.message, 'error');
    }
}

// Admin page
async function initAdminPage() {
    const API_BASE = localStorage.getItem('API_BASE') || 'http://localhost:5000';
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (!currentUser || currentUser.role !== 'admin') {
        showNotification('Admin access only', 'error');
        window.location.href = 'login.html';
        return;
    }

    const productsWrap = document.getElementById('adminProducts');
    const ordersWrap = document.getElementById('adminOrders');
    const form = document.getElementById('productForm');
    const resetBtn = document.getElementById('resetProductBtn');

    async function loadProducts() {
        const resp = await fetch(`${API_BASE}/api/products`);
        const items = await resp.json();
        productsWrap.innerHTML = '';
        items.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-image"><img class="${(p.brand||'').toLowerCase()==='cosmetic'?'cosmetic-img':'perfume-img'}" src="${p.image}" alt="${p.name}"></div>
                <h3>${p.name}</h3>
                <p>${p.description}</p>
                <span class="price">₹${Number(p.price).toLocaleString('en-IN')}</span>
                <div style="display:flex; gap:8px; justify-content:center; margin-top:8px;">
                    <button class="submit-btn" data-edit="${p._id}">Edit</button>
                    <button class="submit-btn" data-del="${p._id}">Delete</button>
                </div>
            `;
            productsWrap.appendChild(card);
        });
    }

    async function loadOrders() {
        const resp = await fetch(`${API_BASE}/api/orders`, { credentials: 'include' });
        const items = await resp.json();
        ordersWrap.innerHTML = '';
        items.forEach(o => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <h3>Order #${o._id}</h3>
                <p>User: ${o.user?.name || ''} (${o.user?.email || ''})</p>
                <p>Status: ${o.status}</p>
                <span class="price">₹${Number(o.totalPrice).toLocaleString('en-IN')}</span>
                <div style="display:flex; gap:8px; justify-content:center; margin-top:8px;">
                    <button class="submit-btn" data-status="processing" data-id="${o._id}">Processing</button>
                    <button class="submit-btn" data-status="shipped" data-id="${o._id}">Shipped</button>
                    <button class="submit-btn" data-status="delivered" data-id="${o._id}">Delivered</button>
                </div>
            `;
            ordersWrap.appendChild(card);
        });
    }

    productsWrap?.addEventListener('click', async (e) => {
        const t = e.target;
        const id = t.getAttribute('data-del') || t.getAttribute('data-edit');
        if (!id) return;
        if (t.hasAttribute('data-del')) {
            const resp = await fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE', credentials: 'include' });
            if (resp.ok) { showNotification('Product deleted', 'success'); loadProducts(); }
            else showNotification('Delete failed', 'error');
        } else if (t.hasAttribute('data-edit')) {
            // preload form
            const resp = await fetch(`${API_BASE}/api/products/${id}`);
            const p = await resp.json();
            document.getElementById('prodId').value = p._id;
            document.getElementById('prodName').value = p.name;
            document.getElementById('prodBrand').value = p.brand;
            document.getElementById('prodPrice').value = p.price;
            document.getElementById('prodStock').value = p.stock;
            document.getElementById('prodImage').value = p.image;
            document.getElementById('prodDesc').value = p.description;
        }
    });

    ordersWrap?.addEventListener('click', async (e) => {
        const t = e.target;
        const id = t.getAttribute('data-id');
        const status = t.getAttribute('data-status');
        if (!id || !status) return;
        const resp = await fetch(`${API_BASE}/api/orders/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ status })
        });
        if (resp.ok) { showNotification('Order updated', 'success'); loadOrders(); }
        else showNotification('Update failed', 'error');
    });

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            name: document.getElementById('prodName').value.trim(),
            brand: document.getElementById('prodBrand').value.trim(),
            price: Number(document.getElementById('prodPrice').value),
            stock: Number(document.getElementById('prodStock').value),
            image: document.getElementById('prodImage').value.trim(),
            description: document.getElementById('prodDesc').value.trim(),
        };
        const id = document.getElementById('prodId').value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_BASE}/api/products/${id}` : `${API_BASE}/api/products`;
        const resp = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });
        if (resp.ok) {
            showNotification('Product saved', 'success');
            form.reset();
            document.getElementById('prodId').value = '';
            loadProducts();
        } else {
            showNotification('Save failed', 'error');
        }
    });

    resetBtn?.addEventListener('click', () => {
        form.reset();
        document.getElementById('prodId').value = '';
    });

    await Promise.all([loadProducts(), loadOrders()]);
}

// Auth state management
function setupAuthState() {
    updateNavbarAuthState();
}

function updateNavbarAuthState() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    // Remove existing auth links
    const existingAuthLinks = navMenu.querySelectorAll('.auth-link');
    existingAuthLinks.forEach(link => link.remove());

    if (user) {
        // User is logged in
        const myOrdersLink = createNavLink('My Orders', 'myorders.html');
        myOrdersLink.classList.add('auth-link');
        navMenu.appendChild(myOrdersLink);

        if (user.role === 'admin') {
            const adminLink = createNavLink('Admin', 'admin.html');
            adminLink.classList.add('auth-link');
            navMenu.appendChild(adminLink);
        }

        const logoutLink = createNavLink('Logout', '#');
        logoutLink.classList.add('auth-link');
        logoutLink.addEventListener('click', handleLogout);
        navMenu.appendChild(logoutLink);
    } else {
        // User is not logged in
        const loginLink = createNavLink('Login', 'login.html');
        loginLink.classList.add('auth-link');
        navMenu.appendChild(loginLink);

        const registerLink = createNavLink('Register', 'register.html');
        registerLink.classList.add('auth-link');
        navMenu.appendChild(registerLink);
    }
}

function createNavLink(text, href) {
    const li = document.createElement('li');
    li.className = 'nav-item';
    const a = document.createElement('a');
    a.href = href;
    a.className = 'nav-link';
    a.textContent = text;
    li.appendChild(a);
    return li;
}

async function handleLogout(e) {
    e.preventDefault();
    try {
        const API_BASE = localStorage.getItem('API_BASE') || `http://${window.location.hostname}:5000`;
        await fetch(`${API_BASE}/api/users/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        localStorage.removeItem('user');
        updateNavbarAuthState();
        showNotification('Logged out successfully', 'success');
        
        // Redirect to home if on protected pages
        if (window.location.pathname.includes('admin.html') || window.location.pathname.includes('myorders.html')) {
            window.location.href = 'index.html';
        }
    } catch (err) {
        showNotification('Logout error', 'error');
    }
}