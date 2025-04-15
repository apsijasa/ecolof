// Estas funciones pueden añadirse al archivo cart.js para manejar la funcionalidad de checkout

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

// Añadir estas funciones al evento DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // ...código existente...
    
    // Si estamos en la página de pago, cargar el resumen del pedido
    if (document.getElementById('order-items')) {
        loadOrderSummary();
        setupPaymentForm();
        setupCardFormatting();
    }
});