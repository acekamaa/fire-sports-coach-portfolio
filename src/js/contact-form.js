const contactForm = document.querySelector('#contact-form');
const contactFormStatus = document.querySelector('#contact-form-status');

if (!(contactForm instanceof HTMLFormElement)) {
  throw new Error('Contact form element was not found.');
}

if (!(contactFormStatus instanceof HTMLElement)) {
  throw new Error('Contact form status element was not found.');
}

const fields = Array.from(
  contactForm.querySelectorAll('input, select, textarea'),
);

function validateField(field) {
  const errorElement = field.parentElement?.querySelector(
    '.contact-field-error',
  );

  if (!(errorElement instanceof HTMLElement)) {
    throw new Error(`Error message element was not found for ${field.name}.`);
  }

  let errorMessage = field.validity.valid ? '' : field.validationMessage;

  if (field.name === 'name' && field.value.trim().length < 2) {
    errorMessage = 'Please enter a name with at least 2 characters.';
  }

  if (field.name === 'message' && field.value.trim().length < 10) {
    errorMessage = 'Please enter a message with at least 10 characters.';
  }

  const isValid = errorMessage.length === 0;
  field.setAttribute('aria-invalid', String(!isValid));
  errorElement.textContent = errorMessage;
  errorElement.hidden = isValid;

  return isValid;
}

fields.forEach((field) => {
  field.addEventListener('blur', () => validateField(field));

  field.addEventListener('input', () => {
    if (field.getAttribute('aria-invalid') === 'true') {
      validateField(field);
    }

    contactFormStatus.hidden = true;
  });
});

contactForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const invalidFields = fields.filter((field) => !validateField(field));

  if (invalidFields.length > 0) {
    contactFormStatus.hidden = true;
    invalidFields[0].focus();
    return;
  }

  contactFormStatus.textContent =
    'This form is not connected to message delivery yet. Your message has not been sent.';
  contactFormStatus.hidden = false;
});