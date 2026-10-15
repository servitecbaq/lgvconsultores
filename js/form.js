/* ============================================
   FORMULARIO DE CONTACTO - LEGAL CONSULTORES S.A.S
   Envío con Web3Forms
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // Endpoint oficial de Web3Forms
    const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

    // Elementos
    const submitBtn = form.querySelector('button[type="submit"]');
    const submitBtnOriginalHTML = submitBtn.innerHTML;
    const formNote = form.querySelector('.form-note');

    // Función para mostrar mensajes al usuario
    function showMessage(type, text) {
        const existingMsg = form.querySelector('.form-message');
        if (existingMsg) existingMsg.remove();

        const msg = document.createElement('div');
        msg.className = `form-message form-message--${type}`;
        msg.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${text}</span>
        `;

        form.insertBefore(msg, formNote);

        setTimeout(() => {
            msg.style.opacity = '0';
            msg.style.transform = 'translateY(-10px)';
            setTimeout(() => msg.remove(), 300);
        }, 8000);
    }

    // Función para cambiar estado del botón
    function setLoading(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <i class="fas fa-spinner fa-spin"></i> Enviando...
            `;
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = submitBtnOriginalHTML;
        }
    }

    // Manejo del envío mediante Fetch API
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        // Convertir los datos a un objeto JSON compatible con Web3Forms
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        setLoading(true);

        try {
            const response = await fetch(WEB3FORMS_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            });

            const result = await response.json();

            if (response.status === 200) {
                showMessage(
                    'success',
                    '¡Gracias por contactarnos! Hemos recibido tu mensaje y te responderemos lo antes posible.'
                );
                form.reset();
            } else {
                showMessage('error', result.message || 'Hubo un problema al enviar el mensaje. Intenta de nuevo.');
            }
        } catch (error) {
            console.error('Error al enviar formulario:', error);
            showMessage(
                'error',
                'No pudimos enviar tu mensaje. Verifica tu conexión o escríbenos por WhatsApp al 314 869 5606.'
            );
        } finally {
            setLoading(false);
        }
    });

    // Limpiar mensajes al escribir
    form.querySelectorAll('input, textarea, select').forEach(field => {
        field.addEventListener('input', () => {
            const msg = form.querySelector('.form-message');
            if (msg) msg.remove();
        });
    });
});