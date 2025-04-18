document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector("#updateForm");
    const updateBtn = form.querySelector("button[type='submit']");
    const initialValues = {};
    
    // Store initial form values
    Array.from(form.elements).forEach(element => {
        if (element.name && element.type !== 'hidden') {
            initialValues[element.name] = element.value;
        }
    });

    form.addEventListener("input", function() {
        let hasChanged = false;
        
        // Check if any field has changed
        Array.from(form.elements).forEach(element => {
            if (element.name && element.type !== 'hidden' && 
                initialValues[element.name] !== element.value) {
                hasChanged = true;
            }
        });

        updateBtn.disabled = !hasChanged;
    });
});