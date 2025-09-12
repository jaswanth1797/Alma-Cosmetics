document.addEventListener('DOMContentLoaded', function() {
    console.log('Website loaded successfully!');
    
    setupMobileNavigation();
    setupSearchAndFilter();
    setupScrollAnimations();
    setupShoppingCart();
    setupContactForm();
    
    showWelcomeMessage();
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
        
        productCards.forEach(card => {
            const productName = card.getAttribute('data-name').toLowerCase();
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
    
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productCard = button.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = parseFloat(productCard.querySelector('.price').textContent.replace('₹', '').replace(',', ''));
            const productDescription = productCard.querySelector('p').textContent;

            addToCart(productName, productPrice, productDescription);
            
            button.classList.add('success-animation');
            setTimeout(() => {
                button.classList.remove('success-animation');
            }, 600);
        });
    });
    
    function addToCart(name, price, description) {
        const existingItem = cart.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name: name,
                price: price,
                description: description,
                quantity: 1
            });
        }
        updateCartDisplay();
        
        showNotification(`${name} added to cart!`);
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
                    <p>Quantity: ${item.quantity} | ₹${(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
                <button onclick="removeFromCart('${item.name}')" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Remove</button>
            `;
            cartItems.appendChild(cartItem);
        });
    
        cartTotalElement.textContent = cartTotal.toLocaleString('en-IN');
        cartCountElement.textContent = totalItems;
    }

    window.removeFromCart = function(name) {
        const itemIndex = cart.findIndex(item => item.name === name);
        if (itemIndex > -1) {
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity -= 1;
            } else {
                cart.splice(itemIndex, 1);
            }
            updateCartDisplay();
            showNotification(`${name} removed from cart!`);
        }
    };
    
    window.toggleCart = function() {
        cartSidebar.classList.toggle('open');
    };
    
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                showNotification('Your cart is empty!', 'warning');
            } else {
                showNotification('Thank you for your purchase!', 'success');
                cart = [];
                updateCartDisplay();
                toggleCart();
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
        addToCart(currentModalProduct.name, currentModalProduct.price, currentModalProduct.description);
    }
    
    closeProductModal();
    showNotification(`${quantity}x ${currentModalProduct.name} added to cart!`, 'success');
}

function buyNow() {
    if (!currentModalProduct) return;
    
    const quantity = parseInt(document.getElementById('quantityInput').value);
    
    // Add to cart and proceed to checkout
    for (let i = 0; i < quantity; i++) {
        addToCart(currentModalProduct.name, currentModalProduct.price, currentModalProduct.description);
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