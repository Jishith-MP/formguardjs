# formguardjs

**FormGuard** is a lightweight and simple JavaScript library for form validation created by Jishith MP. This library is designed to make form validation and error detection straightforward and efficient for developers.

## Features

- **Lightweight**: Minimal file size ensures quick loading times.
- **Easy to Use**: Simplifies the process of implementing form validation.
- **Data-Rules Attribute**: Utilize the `data-rules` attribute in your HTML elements to define validation rules in a simple JSON format.
- **Error Detection**: Quickly identifies errors in form inputs to enhance user experience.

## Getting Started

To get started with FormGuard, include it in your project and apply the `data-rules` attribute to your form elements. Here’s a basic example:

```html
<form id="myForm">
  <input type="text" name="username" data-rules='{"required": true, "minLength": 3}' />
  <input type="email" name="email" data-rules='{"required": true, "email": true}' />
  <button type="submit">Submit</button>
</form>
