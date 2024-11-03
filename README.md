# FormGuard

**FormGuard** is a lightweight and simple JavaScript library for form validation created by Jishith MP. This library is designed to make form validation and error detection straightforward and efficient for developers.

## Features

- **Lightweight**: Minimal file size ensures quick loading times.
- **Easy to Use**: Simplifies the process of implementing form validation.
- **Data-Rules Attribute**: Utilize the `data-rules` attribute in your HTML elements to define validation rules in a simple JSON format.
- **Error Detection**: Quickly identifies errors in form inputs to enhance user experience.
- **Customization**: Various options for error display, including colors and font sizes.

## Getting Started

### Installation

1. **Install Node.js**: If you don't have Node.js installed, use the following command in your terminal:
   ```bash
   pkg install nodejs
   ```

2. **Install FormGuard**: After installing Node.js, you can install FormGuard using npm:
   ```bash
   npm install formguardjs
   ```

3. **CDN Module**: FormGuard is also available via a CDN on the [official website](https://formguardjs.web.app).

### Usage

Once installed, you can easily initialize FormGuard in your JavaScript:

#### Import Syntax

For ES6 modules:
```javascript
import FormGuard from 'formguardjs';
```

For CommonJS:
```javascript
const FormGuard = require('formguardjs');
```

#### Example Usage

Here’s an example of how to set up your form:

```html
<form id="myForm">
  <input type="text" name="username" data-rules='{"required": true, "minLength": 3}' />
  <input type="email" name="email" data-rules='{"required": true, "email": true}' />
  <button type="submit">Submit</button>
</form>
```

#### Initialization

To initialize the validator, use the following code:

```javascript
// Example usage
const form = document.querySelector('#myForm');
const validator = new FormGuard(form, { 
    // Optional configurations
    errorBorderColor: 'yellow',
    errorMessageColor: 'beige',
    errorMessageFontSize: '10px',
    errorMessageMarginBottom: '5px',
    errorMessageMarginTop: '3px'
});
validator.init();
```

**Note**: The optional configurations have default values, so you can customize them according to your needs.

## Contributing

Contributions are welcome! If you have suggestions or improvements, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License.

---

For more information, please check the [Documentation](https://formguardjs.web.app/documentation.html)
