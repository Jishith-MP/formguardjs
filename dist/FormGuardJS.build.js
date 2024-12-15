/**
 * FormGuardJS - A lightweight form validation library
 * 
 * FormGuardJS.build.js
 * 
 * Version: 1.1.2
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

console.log("This is the development version of FormGuardJS. For production, use the minified (.min.js) version");

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

class FormGuard {
   constructor(form, options = {}) {
      this.form = form;
      this.options = options;
      this.errors = {};
      this.handleSubmit = this.handleSubmit.bind(this);


      if (!this.options.onSubmit || typeof this.options.onSubmit !== 'function') {
         throw new Error('The `onSubmit` callback is required and must be a function.');
      }

      this.initialize();
   }

   async initialize() {

      this.form.addEventListener('submit', this.handleSubmit);
   }

   async handleSubmit(event) {
      try {
         this.clearErrorMessages(); 
         const inputs = this.form.querySelectorAll('input, textarea');
         let valid = true;

         inputs.forEach(input => {
            if (!input.name) {
               console.error(`error: the input field is missing a *name attribute! Element:`, input);
               valid = false;
            }
         });

         this.init();

         if (!valid || Object.keys(this.errors).length > 0) {
            event.preventDefault(); 
            return;
         }



         await this.options.onSubmit(new FormData(this.form), event);
      } catch (error) {
         console.error('Error during form submission:', error);
      }
   }


   async init() {
      this.clearErrors();
      const inputs = this.form.querySelectorAll('input, textarea');

      const fetchRulesPromises = Array.from(inputs).map(async (input) => {
         let rules = {};

         try {
            const dataRules = input.dataset.rules;

            if (dataRules) {
               if (dataRules.trim().startsWith('{')) {
                  // Inline JSON
                  rules = JSON.parse(dataRules);
               } else if (dataRules.trim().startsWith('https://')) {
                  // URL
                  try {
                     const response = await fetch(dataRules);
                     const data = await response.json();
                     rules = data || {};
                  } catch (e) {
                     console.error(`error fetching rules from ${dataRules}:`, e.message);
                  }
               } else if (isValidPath(dataRules)) {
                  // Path
                  try {
                     const response = await fetch(dataRules);
                     const data = await response.json();
                     rules = data || {}; 
                  } catch (e) {
                     console.error(`error fetching rules from ${dataRules}:`, e.message);
                  }
               } else {
                  console.error('Invalid data-rules value:', dataRules);
               }
            }

            rules = rules || {}; 

            function isValidPath(path) {
               return /^[a-zA-Z0-9/_-]+(\.[a-zA-Z0-9]+)?$/.test(path);
            }

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

             //tel validation 
            if (input.type === 'tel') {
               const telPattern = /^[0-9]{10}$/;
               if (input.value.trim() && !telPattern.test(input.value)) {
                  this.addError(input, 'Please enter a valid phone number');
                  this.applyErrorStyle(input);
               }
            }

             //file validation
            if (input.type === 'file' && input.files.length === 0 && rules.required) {
               this.addError(input, 'Please select a file');
               this.applyErrorStyle(input);
            }

             //range validation 
            if (input.type === 'range' && (input.value < rules.min || input.value > rules.max)) {
               this.addError(input, `Value must be between ${rules.min} and ${rules.max}`);
               this.applyErrorStyle(input);
            }

             //time validation 
            if (input.type === 'time' && rules.required && !input.value.trim()) {
               this.addError(input, 'Time is required');
               this.applyErrorStyle(input);
            }

            if (rules.pattern && input.value.trim()) {
               try {
                  const regex = new RegExp(rules.pattern);

                  if (!regex.test(input.value)) {
                     this.addError(input, rules.messages?.pattern || 'Invalid format');
                     this.applyErrorStyle(input);
                  }
               } catch (error) {
                  console.error('Regex pattern error:', error); 
                  this.addError(input, 'Invalid format'); 
                  this.applyErrorStyle(input);
               }
            }

            if (rules.match) {
               const matchElement = document.querySelector(`[name="${rules.match}"]`);
               if (matchElement && input.value !== matchElement.value) {
                  this.addError(input, rules.messages?.match || 'Fields do not match');
                  this.applyErrorStyle(input);
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

      await Promise.all(fetchRulesPromises);
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
         const placement = input.dataset.errorPlacement || 'after';
         if (placement === 'before') {
            input.parentNode.insertBefore(errorMessage, input);
         } else if (placement === 'after') {
            input.parentNode.insertBefore(errorMessage, input.nextSibling);
         } else if (placement === 'inline') {
            input.parentNode.insertBefore(errorMessage, input.nextSibling);
         } else {
            console.error(`error: non speacified value used in *error-placement attribute in the element : ${input.name}`);
         }
      }
   }

   resetForm() {
      this.form.reset();
      this.clearErrorMessages();
   }

   clearErrorMessages() {
      document.querySelectorAll('.formGuard_error-message').forEach(error => error.remove());
      document.querySelectorAll('.formGuard_error-field').forEach(input => input.classList.remove('formGuard_error-field'));
   }
}
