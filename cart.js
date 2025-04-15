// Inicializar el carrito
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Función para añadir un producto al carrito
function addToCart(productId, productName, productImage, productPrice, quantity = 1) {
    // Buscar si el producto ya está en el carrito
    const existingProductIndex = cart.findIndex(item => item.id === productId);
    
    if (existingProductIndex > -1) {
        // Si el producto ya está en el carrito, incrementar la cantidad
        cart[existingProductIndex].quantity += quantity;
    } else {
        // Si el producto no está en el carrito, añadirlo
        cart.push({
            id: productId,
            name: productName,
            image: productImage,
            price: productPrice,
            quantity: quantity
        });
    }
    
    // Guardar el carrito en localStorage
    saveCart();
    
    // Mostrar mensaje de confirmación
    showNotification(`${productName} ha sido añadido al carrito`);
    
    // Actualizar contador del carrito
    updateCartCounter();
}

// Función para guardar el carrito en localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Función para mostrar una notificación
function showNotification(message) {
    // Crear el elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <p>${message}</p>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Añadir la notificación al DOM
    document.body.appendChild(notification);
    
    // Mostrar la notificación
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Añadir evento para cerrar la notificación
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Ocultar la notificación después de 5 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Función para actualizar el contador del carrito
function updateCartCounter() {
    const cartCounter = document.getElementById('cart-counter');
    if (cartCounter) {
        const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
        cartCounter.textContent = itemCount;
        
        // Mostrar u ocultar el contador según haya o no productos
        if (itemCount > 0) {
            cartCounter.style.display = 'flex';
        } else {
            cartCounter.style.display = 'none';
        }
    }
}

// Vincular eventos a los botones de compra cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el contador del carrito
    updateCartCounter();
    
    // Obtener todos los botones de compra
    const buyButtons = document.querySelectorAll('.btn-secondary');
    
    buyButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Obtener datos del producto desde el elemento padre
            const productCard = this.closest('.producto-card');
            const productId = productCard.dataset.productId || Date.now().toString();
            const productName = productCard.querySelector('h3').textContent;
            const productImage = productCard.querySelector('img').src;
            const productPriceText = productCard.querySelector('.producto-precio') 
                ? productCard.querySelector('.producto-precio').textContent 
                : '0';
            
            // Extraer el número del texto del precio
            const productPrice = parseFloat(productPriceText.replace(/[^\d.]/g, ''));
            
            // Añadir al carrito
            addToCart(productId, productName, productImage, productPrice);
        });
    });
    
    // Si estamos en la página del carrito, cargar los productos
    if (document.getElementById('cart-items-container')) {
        loadCartItems();
    }
    
    // Si estamos en la página de pago, inicializar las funciones correspondientes
    if (document.getElementById('payment-form')) {
        loadOrderSummary();
        setupPaymentForm();
        setupCardFormatting();
    }
});

// Función para cargar los productos en la página del carrito
function loadCartItems() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart"><p>Tu carrito está vacío</p><a href="index.html#productos" class="btn-secondary">Ver Productos</a></div>';
        updateCartSummary(0, 0, 0);
        return;
    }
    
    let cartHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        cartHTML += `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p class="item-price">$${item.price.toFixed(2)}</p>
                </div>
                <div class="item-quantity">
                    <button class="quantity-btn decrease"><i class="fas fa-minus"></i></button>
                    <input type="number" value="${item.quantity}" min="1" max="10">
                    <button class="quantity-btn increase"><i class="fas fa-plus"></i></button>
                </div>
                <div class="item-total">
                    <p>$${itemTotal.toFixed(2)}</p>
                </div>
                <div class="item-remove">
                    <button class="remove-btn"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = cartHTML;
    
    // Calcular envío e impuestos
    const shipping = subtotal > 0 ? 5 : 0;
    const tax = subtotal * 0.08; // 8% de impuestos
    const total = subtotal + shipping + tax;
    
    // Actualizar el resumen del carrito
    updateCartSummary(subtotal, shipping, tax, total);
    
    // Añadir eventos a los botones de cantidad y eliminar
    addCartItemEvents();
}

// Función para actualizar el resumen del carrito
function updateCartSummary(subtotal, shipping, tax, total) {
    const subtotalElement = document.getElementById('cart-subtotal');
    const shippingElement = document.getElementById('cart-shipping');
    const taxElement = document.getElementById('cart-tax');
    const totalElement = document.getElementById('cart-total');
    
    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingElement) shippingElement.textContent = `$${shipping.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
}

// Función para añadir eventos a los elementos del carrito
function addCartItemEvents() {
    // Eventos para los botones de incrementar/decrementar cantidad
    document.querySelectorAll('.quantity-btn.increase').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            let value = parseInt(input.value);
            if (value < 10) {
                input.value = value + 1;
                updateItemQuantity(this.closest('.cart-item'), input.value);
            }
        });
    });
    
    document.querySelectorAll('.quantity-btn.decrease').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            let value = parseInt(input.value);
            if (value > 1) {
                input.value = value - 1;
                updateItemQuantity(this.closest('.cart-item'), input.value);
            }
        });
    });
    
    // Eventos para los campos de entrada de cantidad
    document.querySelectorAll('.item-quantity input').forEach(input => {
        input.addEventListener('change', function() {
            let value = parseInt(this.value);
            if (isNaN(value) || value < 1) {
                this.value = 1;
                value = 1;
            } else if (value > 10) {
                this.value = 10;
                value = 10;
            }
            updateItemQuantity(this.closest('.cart-item'), value);
        });
    });
    
    // Eventos para los botones de eliminar
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
            removeFromCart(this.closest('.cart-item'));
        });
    });
}

// Función para actualizar la cantidad de un producto
function updateItemQuantity(cartItem, quantity) {
    const productId = cartItem.dataset.productId;
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex > -1) {
        cart[itemIndex].quantity = quantity;
        saveCart();
        
        // Actualizar el total del ítem
        const itemPrice = cart[itemIndex].price;
        const itemTotal = itemPrice * quantity;
        cartItem.querySelector('.item-total p').textContent = `$${itemTotal.toFixed(2)}`;
        
        // Recalcular el resumen del carrito
        recalculateCartSummary();
        
        // Actualizar el contador del carrito
        updateCartCounter();
    }
}

// Función para eliminar un producto del carrito
function removeFromCart(cartItem) {
    const productId = cartItem.dataset.productId;
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex > -1) {
        // Obtener el nombre del producto para la notificación
        const productName = cart[itemIndex].name;
        
        // Eliminar el producto del array
        cart.splice(itemIndex, 1);
        saveCart();
        
        // Mostrar notificación
        showNotification(`${productName} ha sido eliminado del carrito`);
        
        // Eliminar el elemento del DOM con una animación
        cartItem.classList.add('removing');
        setTimeout(() => {
            cartItem.remove();
            
            // Si el carrito está vacío, mostrar mensaje
            if (cart.length === 0) {
                const cartItemsContainer = document.getElementById('cart-items-container');
                cartItemsContainer.innerHTML = '<div class="empty-cart"><p>Tu carrito está vacío</p><a href="index.html#productos" class="btn-secondary">Ver Productos</a></div>';
            }
            
            // Recalcular el resumen del carrito
            recalculateCartSummary();
            
            // Actualizar el contador del carrito
            updateCartCounter();
        }, 300);
    }
}

// Función para recalcular el resumen del carrito
function recalculateCartSummary() {
    let subtotal = 0;
    
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    const shipping = subtotal > 0 ? 5 : 0;
    const tax = subtotal * 0.08; // 8% de impuestos
    const total = subtotal + shipping + tax;
    
    updateCartSummary(subtotal, shipping, tax, total);
}

// ===== FUNCIONES DE CHECKOUT.JS INTEGRADAS =====

// Función para cargar los datos del carrito en el resumen del pedido de la página de pago
function loadOrderSummary() {
    const orderItemsContainer = document.getElementById('order-items');
    if (!orderItemsContainer) return;
    
    let orderHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        orderHTML += `
            <div class="order-item">
                <div class="item-thumb">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>Cantidad: ${item.quantity}</p>
                </div>
                <div class="item-price">
                    <p>$${itemTotal.toFixed(2)}</p>
                </div>
            </div>
        `;
    });
    
    orderItemsContainer.innerHTML = orderHTML;
    
    // Calcular y actualizar totales
    const shipping = subtotal > 0 ? 5.00 : 0.00;
    const tax = subtotal * 0.08; // 8% de impuestos
    const total = subtotal + shipping + tax;
    
    document.getElementById('order-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('order-shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('order-tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('order-total').textContent = `$${total.toFixed(2)}`;
}

// Función para manejar el envío del formulario de pago
function setupPaymentForm() {
    const paymentForm = document.getElementById('payment-form');
    if (!paymentForm) return;
    
    paymentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar el formulario
        if (!validatePaymentForm()) {
            return;
        }
        
        // Aquí se podría agregar una llamada a un servicio de procesamiento de pagos
        // Por ahora, simplemente simularemos un pago exitoso
        
        // Mostrar mensaje de confirmación
        alert('¡Pago procesado con éxito! Gracias por tu compra.');
        
        // Limpiar el carrito
        cart = [];
        saveCart();
        
        // Redirigir a la página de inicio o de confirmación
        window.location.href = 'index.html';
    });
}

// Función para validar el formulario de pago
function validatePaymentForm() {
    // Validar nombre
    const nombre = document.getElementById('nombre').value.trim();
    if (nombre.length < 3) {
        alert('Por favor, ingresa un nombre válido');
        return false;
    }
    
    // Validar email
    const email = document.getElementById('email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Por favor, ingresa un email válido');
        return false;
    }
    
    // Validar teléfono
    const telefono = document.getElementById('telefono').value.trim();
    if (telefono.length < 7) {
        alert('Por favor, ingresa un número de teléfono válido');
        return false;
    }
    
    // Validar dirección
    const direccion = document.getElementById('direccion').value.trim();
    if (direccion.length < 5) {
        alert('Por favor, ingresa una dirección válida');
        return false;
    }
    
    // Validar tarjeta de crédito si está seleccionado ese método de pago
    if (document.getElementById('credit-card').checked) {
        // Validar número de tarjeta
        const cardNumber = document.getElementById('card-number').value.replace(/\D/g, '');
        if (cardNumber.length < 15 || cardNumber.length > 16) {
            alert('Por favor, ingresa un número de tarjeta válido');
            return false;
        }
        
        // Validar fecha de expiración
        const expiry = document.getElementById('expiry').value.trim();
        const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!expiryRegex.test(expiry)) {
            alert('Por favor, ingresa una fecha de expiración válida (MM/AA)');
            return false;
        }
        
        // Validar CVV
        const cvv = document.getElementById('cvv').value.trim();
        if (cvv.length < 3 || cvv.length > 4) {
            alert('Por favor, ingresa un CVV válido');
            return false;
        }
        
        // Validar nombre en la tarjeta
        const cardName = document.getElementById('card-name').value.trim();
        if (cardName.length < 3) {
            alert('Por favor, ingresa el nombre en la tarjeta');
            return false;
        }
    }
    
    // Validar términos y condiciones
    if (!document.getElementById('terms').checked) {
        alert('Debes aceptar los términos y condiciones');
        return false;
    }
    
    return true;
}

// Función para formatear el número de tarjeta mientras se escribe
function setupCardFormatting() {
    const cardNumberInput = document.getElementById('card-number');
    if (!cardNumberInput) return;
    
    cardNumberInput.addEventListener('input', function(e) {
        // Eliminar todos los espacios y caracteres no numéricos
        let value = this.value.replace(/\D/g, '');
        
        // Limitar a 16 dígitos
        if (value.length > 16) {
            value = value.substr(0, 16);
        }
        
        // Formatear con espacios cada 4 dígitos
        const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        
        // Actualizar el valor del campo
        this.value = formatted;
    });
    
    // Formatear la fecha de expiración
    const expiryInput = document.getElementById('expiry');
    if (!expiryInput) return;
    
    expiryInput.addEventListener('input', function(e) {
        // Eliminar todos los caracteres no numéricos y la barra
        let value = this.value.replace(/[^\d/]/g, '');
        
        // Insertar automáticamente la barra después de los primeros 2 dígitos
        if (value.length >= 2 && !value.includes('/')) {
            const month = value.substr(0, 2);
            const year = value.substr(2);
            value = month + '/' + year;
        }
        
        // Limitar a 5 caracteres (MM/YY)
        if (value.length > 5) {
            value = value.substr(0, 5);
        }
        
        // Actualizar el valor del campo
        this.value = value;
    });
}