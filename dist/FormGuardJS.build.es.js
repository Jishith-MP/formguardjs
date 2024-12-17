/**
 * FormGuardJS - A lightweight form validation library
 * 
 * Version: 1.0.2
 * 
 * Note: This is the development version. In production, use the minified version.
 * 
 * Copyright (c) 2024 Jishith MP
 * 
 * This software is released under the MIT License.
 * 
 * Author: Jishith MP
 * License: MIT
 */

console.log("This is the development version of FormGuardJS For production, use the *min.js version!");

const styles = document.createElement('style');
styles.innerHTML = `
    .formGuard_error-message {
        color: red;
        font-size: 0.9em;
        margin-bottom: 10px;
    }
    .formGuard_error-field {
        border-color: red;
    }
`;
document.head.insertBefore(styles, document.head.firstChild);

 export default class FormGuard {
  constructor(form, options = {}) {
    this.form = form;
    this.options = options;
    this.errors = {};

    if (!this.options.onSubmit || typeof this.options.onSubmit !== 'function') {
      throw new Error('The `onSubmit` callback is required and must be a function.');
    }

    this.initialize();
  }

  initialize() {
    this.form.addEventListener('submit', async (event) => {
      this.clearErrorMessages(); // Clear previous error messages
      const inputs = this.form.querySelectorAll('input, textarea');
      let valid = true;

      inputs.forEach(input => {
        if (!input.name) {
          console.error(`Validation error: the input field is missing a *name attribute! Element:`, input);
          valid = false;
        }
      });

      this.init();

      if (!valid || Object.keys(this.errors).length > 0) {
        event.preventDefault(); // Prevent form submission if validation fails
        return;
      }


      try {
        await this.options.onSubmit(new FormData(this.form), event);
      } catch (error) {
        console.error('Error during form submission:', error);
      }
    });
  }

  init() {
    this.clearErrors();
    const inputs = this.form.querySelectorAll('input, textarea');

    inputs.forEach(input => {
      try {
        const rules = input.dataset.rules ? JSON.parse(input.dataset.rules) : {};
        if (!input.dataset.rules) {
          console.error(`No rules found for ${input.name}: *data-rules attribute is missing!`);
        }

        // Required field validation
        if (rules.required && !input.value.trim()) {
          this.addError(input, rules.messages?.required || 'This field is required');
          this.applyErrorStyle(input);
        }

        // Number validation
        if (input.type === 'number' && input.value.trim() !== '') {
          if (rules.min && input.value < rules.min) {
            this.addError(input, rules.messages?.min || `Minimum value is ${rules.min}`);
            this.applyErrorStyle(input);
          }
          if (rules.max && input.value > rules.max) {
            this.addError(input, rules.messages?.max || `Maximum value is ${rules.max}`);
            this.applyErrorStyle(input);
          }
        }

        // Email validation
        if (input.type === 'email') {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (rules.required === true && !input.value.trim()) {
            this.addError(input, rules.messages?.required || 'Email is required');
            this.applyErrorStyle(input);
          } else if (input.value.trim() !== '' && !emailPattern.test(input.value)) {
            this.addError(input, rules.messages?.invalid || 'Please enter a valid email address');
            this.applyErrorStyle(input);
          }
        }

        // Password validation
        if (input.type === 'password') this.validatePassword(input, rules.password || {});

        // Checkbox validation
        if (input.type === 'checkbox' && rules.required) {
          const checkboxes = this.form.querySelectorAll(`input[name="${input.name}"]`);
          const checked = Array.from(checkboxes).some(checkbox => checkbox.checked);
          if (!checked) {
            this.addError(input, rules.messages?.required || 'At least one option must be selected');
            this.applyErrorStyle(input);
          }
        }

        // Validate text input for minLength and maxLength
        if (input.type === 'text' || input.tagName.toLowerCase() === 'textarea') {
          const minLength = rules.minLength || null;
          const maxLength = rules.maxLength || null;
          if (input.value.trim() !== "") {
            if (minLength && input.value.length < minLength) {
              this.addError(input, rules.messages?.minLength || `Must be at least ${minLength} characters`);
              this.applyErrorStyle(input);
            }
            if (maxLength && input.value.length > maxLength) {
              this.addError(input, rules.messages?.maxLength || `Must be no more than ${maxLength} characters`);
              this.applyErrorStyle(input);
            }
          }
        }

        // URL validation
        if (input.type === 'url') {
          const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
          if (rules.required === true && !input.value.trim()) {
            this.addError(input, rules.messages?.required || 'URL is required');
            this.applyErrorStyle(input);
          } else if (input.value.trim() !== '' && !urlPattern.test(input.value)) {
            this.addError(input, rules.messages?.invalid || 'Please enter a valid URL');
            this.applyErrorStyle(input);
          }
        }

        // Radio button validation
        if (input.type === 'radio' && rules.required) {
          const radios = this.form.querySelectorAll(`input[name="${input.name}"]`);
          const checked = Array.from(radios).some(radio => radio.checked);
          if (!checked) {
            this.addError(input, rules.messages?.required || 'Please select an option');
            this.applyErrorStyle(input);
          }
        }
      } catch (e) {
        console.error(`Error parsing rules for *${input.name}: ${e.message}`);
      }
    });
    this.showErrors();
  }

  validatePassword(input, passwordRules) {
    const { minLength = 8, capitalLetters = 1, smallLetters = 1, numbers = 1, symbols = 1, messages = {} } = passwordRules;
    let password = input.value;
    let capCount = (password.match(/[A-Z]/g) || []).length;
    let smallCount = (password.match(/[a-z]/g) || []).length;
    let numberCount = (password.match(/\d/g) || []).length;
    let symbolCount = (password.match(/[\W_]/g) || []).length;

    // Validate password length
    if (password.length < minLength) {
      this.addError(input, messages.minLength || `Password must be at least ${minLength} characters`);
      this.applyErrorStyle(input);
    }
    // Validate the number of capital letters
    if (capCount < capitalLetters) {
      this.addError(input, messages.capitalLetters || `Password must contain at least ${capitalLetters} capital letter(s)`);
      this.applyErrorStyle(input);
    }
    // Validate the number of lowercase letters
    if (smallCount < smallLetters) {
      this.addError(input, messages.smallLetters || `Password must contain at least ${smallLetters} small letter(s)`);
      this.applyErrorStyle(input);
    }
    // Validate the number of numbers
    if (numberCount < numbers) {
      this.addError(input, messages.numbers || `Password must contain at least ${numbers} number(s)`);
      this.applyErrorStyle(input);
    }
    // Validate the number of special symbols
    if (symbolCount < symbols) {
      this.addError(input, messages.symbols || `Password must contain at least ${symbols} symbol(s)`);
      this.applyErrorStyle(input);
    }
  }

  addError(input, message) {
    this.errors[input.name] = message;
  }

  clearErrors() {
    this.errors = {};
  }

  applyErrorStyle(input) {
    input.classList.add('formGuard_error-field');
  }

  showErrors() {
    for (const name in this.errors) {
      const input = this.form.querySelector(`[name="${name}"]`);
      const errorMessage = document.createElement('div');
      errorMessage.classList.add('formGuard_error-message');
      errorMessage.textContent = this.errors[name];
      input.parentNode.insertBefore(errorMessage, input.nextSibling);
    }
  }

  clearErrorMessages() {
    document.querySelectorAll('.formGuard_error-message').forEach(error => error.remove());
    document.querySelectorAll('.formGuard_error-field').forEach(input => input.classList.remove('formGuard_error-field'));
  }
}