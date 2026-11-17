const contactForm = document.querySelector('#contact-form');
const contactFormStatus = document.querySelector('#contact-form-status');
const googleFormResponseUrl =
  'https://docs.google.com/forms/d/e/1FAIpQLSfESBSrFyFPpYu2RZi2TKPGXCW_CteQ5b3V3ApFwAFAgj_Fqw/formResponse';

if (!(contactForm instanceof HTMLFormElement)) {
  throw new Error('Contact form element was not found.');
}

if (!(contactFormStatus instanceof HTMLElement)) {
  throw new Error('Contact form status element was not found.');
}

const submitButton = contactForm.querySelector('button[type="submit"]');

if (!(submitButton instanceof HTMLButtonElement)) {
  throw new Error('Contact form submit button was not found.');
}

const fields = Array.from(
  contactForm.querySelectorAll('input, select, textarea'),
);
let isSubmitting = false;

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

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (isSubmitting) {
    return;
  }

  const invalidFields = fields.filter((field) => !validateField(field));

  if (invalidFields.length > 0) {
    contactFormStatus.hidden = true;
    invalidFields[0].focus();
    return;
  }

  const topicField = contactForm.querySelector('#contact-topic');

  if (!(topicField instanceof HTMLSelectElement)) {
    throw new Error('Contact form topic field was not found.');
  }

  const formData = new URLSearchParams({
    'entry.1159582695': contactForm.elements.namedItem('name').value.trim(),
    'entry.639139165': contactForm.elements.namedItem('phone').value.trim(),
    'entry.477408870': contactForm.elements.namedItem('email').value.trim(),
    'entry.1984752420': topicField.selectedOptions[0].textContent.trim(),
    'entry.50255038': contactForm.elements.namedItem('message').value.trim(),
  });
  const submittedValues = fields.map((field) => field.value);

  isSubmitting = true;
  submitButton.disabled = true;
  submitButton.textContent = 'Sending...';
  fields.forEach((field) => {
    field.disabled = true;
  });
  contactFormStatus.textContent = 'Sending your message...';
  contactFormStatus.hidden = false;
  contactForm.reset();

  try {
    await fetch(googleFormResponseUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: formData,
    });

    contactFormStatus.textContent =
      'Your message was sent to Google Forms, but this page cannot confirm whether it was recorded.';
  } catch {
    fields.forEach((field, index) => {
      field.value = submittedValues[index];
    });
    contactFormStatus.textContent =
      'We could not submit your message. Please check your connection and try again.';
  } finally {
    isSubmitting = false;
    submitButton.disabled = false;
    submitButton.textContent = 'Send a message';
    fields.forEach((field) => {
      field.disabled = false;
    });
  }
});
