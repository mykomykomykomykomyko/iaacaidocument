How can I edit this code?
There are several ways of editing your application.

Use Lovable

Simply visit the Lovable Project and start prompting.

Changes made via Lovable will be committed automatically to this repo.

Use your preferred IDE

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - install with nvm

Follow these steps:

# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
Edit a file directly in GitHub

Navigate to the desired file(s).
Click the "Edit" button (pencil icon) at the top right of the file view.
Make your changes and commit the changes.
Use GitHub Codespaces

Navigate to the main page of your repository.
Click on the "Code" button (green button) near the top right.
Select the "Codespaces" tab.
Click on "New codespace" to launch a new Codespace environment.
Edit files directly within the Codespace and commit and push your changes once you're done.
What technologies are used for this project?
This project is built with:

Vite
TypeScript
React
shadcn-ui
Tailwind CSS
How can I deploy this project?
Simply open Lovable and click on Share -> Publish.

Can I connect a custom domain to my Lovable project?
Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: Setting up a custom domain

# Canada.ca Design System Stylesheet - Usage Guide

**Version:** 1.0  
**Author:** Ministry of Technology and Innovation x Impact Assessment Agency of Canada
**Last Updated:** July 28, 2025

## Executive Summary

This comprehensive stylesheet transforms any existing website to follow the official Canada.ca design system specifications. Based on the Government of Canada's mandatory design elements, this stylesheet provides a complete implementation of typography, colors, layouts, and interactive components that ensure accessibility, consistency, and professional government-standard presentation.

The stylesheet is designed for immediate implementation with minimal configuration required. Simply include the CSS file and apply the provided classes to achieve full compliance with Canada.ca design standards, including WCAG AAA accessibility requirements and responsive design principles.

## Quick Start

### 1. Include the Stylesheet

Add the following line to your HTML `<head>` section:

```html
<link rel="stylesheet" href="canada-design-stylesheet.css">
```

### 2. Apply Basic Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Page Title</title>
    <link rel="stylesheet" href="canada-design-stylesheet.css">
</head>
<body>
    <header class="canada-header">
        <div class="canada-header-content">
            <a href="#" class="canada-logo">Your Organization</a>
            <nav class="canada-nav">
                <a href="#">Home</a>
                <a href="#">Services</a>
                <a href="#">Contact</a>
            </nav>
        </div>
    </header>
    
    <main class="canada-container">
        <h1>Page Title</h1>
        <p>Your content here...</p>
    </main>
    
    <footer class="canada-footer">
        <div class="canada-container">
            <p>&copy; 2025 Your Organization</p>
        </div>
    </footer>
</body>
</html>
```

### 3. Instant Transformation

Your website will immediately adopt:
- Official Canada.ca typography (Lato headings, Noto Sans body)
- Government-standard color palette
- Responsive grid system
- Accessibility-compliant components
- Professional government styling

## Design System Foundation

### Typography System

The stylesheet implements the exact typography specifications from Canada.ca:

**Desktop/Tablet Sizes:**
- H1: Lato 41px bold (with signature red underline)
- H2: Lato 39px bold
- H3: Lato 29px bold
- H4: Lato 27px bold
- H5: Lato 24px bold
- H6: Lato 22px bold
- Body: Noto Sans 20px regular

**Mobile Sizes:**
- H1: Lato 37px bold
- H2: Lato 35px bold
- H3: Lato 26px bold
- H4: Lato 22px bold
- H5: Lato 20px bold
- H6: Lato 18px bold
- Body: Noto Sans 18px regular

### Color Palette

The stylesheet includes all official Canada.ca colors:

| Color Purpose | Hex Code | CSS Variable |
|---------------|----------|--------------|
| Canada Red (Brand) | #A62A1E | --canada-red |
| Text Color | #333333 | --canada-text |
| Background | #FFFFFF | --canada-background |
| Main Accent | #26374A | --canada-accent |
| Default Link | #284162 | --canada-link |
| Hover Link | #0535d2 | --canada-link-hover |
| Visited Link | #7834bc | --canada-link-visited |
| Error/Required | #d3080c | --canada-error |

### Layout System

The responsive grid system provides:
- Maximum content width: 1140px
- Automatic single-column layout on mobile
- Flexible grid options (2, 3, 4 columns)
- Consistent spacing system
- Line length optimization (65 characters)

## Component Library

### Buttons

```html
<!-- Primary Button -->
<button class="canada-btn canada-btn-primary">Primary Action</button>

<!-- Secondary Button -->
<button class="canada-btn canada-btn-secondary">Secondary Action</button>

<!-- Link Button -->
<a href="#" class="canada-btn canada-btn-primary">Link Button</a>
```

### Forms

```html
<form>
    <div class="canada-form-group">
        <label class="canada-label" for="name">Full Name</label>
        <input type="text" id="name" class="canada-input" required>
    </div>
    
    <div class="canada-form-group">
        <label class="canada-label" for="email">Email Address</label>
        <input type="email" id="email" class="canada-input">
    </div>
    
    <div class="canada-form-group">
        <label class="canada-label" for="message">Message</label>
        <textarea id="message" class="canada-textarea" rows="4"></textarea>
    </div>
    
    <div class="canada-checkbox">
        <input type="checkbox" id="agree">
        <label for="agree">I agree to the terms and conditions</label>
    </div>
    
    <button type="submit" class="canada-btn canada-btn-primary">Submit</button>
</form>
```

### Alerts

```html
<!-- Information Alert -->
<div class="canada-alert canada-alert-info">
    <p>This is important information for users.</p>
</div>

<!-- Warning Alert -->
<div class="canada-alert canada-alert-warning">
    <p>Please review this warning message.</p>
</div>

<!-- Error Alert -->
<div class="canada-alert canada-alert-error">
    <p>An error has occurred. Please try again.</p>
</div>

<!-- Success Alert -->
<div class="canada-alert canada-alert-success">
    <p>Your action was completed successfully.</p>
</div>
```

### Cards

```html
<div class="canada-card">
    <div class="canada-card-header">
        <h3 class="canada-card-title">Card Title</h3>
    </div>
    <p>Card content goes here. This component provides a clean, elevated container for related information.</p>
    <a href="#" class="canada-btn canada-btn-primary">Learn More</a>
</div>
```

### Tables

```html
<table class="canada-table">
    <thead>
        <tr>
            <th>Service</th>
            <th>Description</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Online Applications</td>
            <td>Submit applications digitally</td>
            <td>Available</td>
        </tr>
        <tr>
            <td>Document Verification</td>
            <td>Verify official documents</td>
            <td>Available</td>
        </tr>
    </tbody>
</table>
```

### Breadcrumbs

```html
<nav class="canada-breadcrumb">
    <ol>
        <li><a href="#">Home</a></li>
        <li><a href="#">Services</a></li>
        <li><a href="#">Applications</a></li>
        <li>Current Page</li>
    </ol>
</nav>
```

### Grid Layouts

```html
<!-- Two Column Grid -->
<div class="canada-grid canada-grid-2">
    <div class="canada-card">
        <h3>Service 1</h3>
        <p>Description of service 1</p>
    </div>
    <div class="canada-card">
        <h3>Service 2</h3>
        <p>Description of service 2</p>
    </div>
</div>

<!-- Three Column Grid -->
<div class="canada-grid canada-grid-3">
    <div class="canada-card">Content 1</div>
    <div class="canada-card">Content 2</div>
    <div class="canada-card">Content 3</div>
</div>
```

## Advanced Implementation

### Custom CSS Variables

You can customize the design system by overriding CSS variables:

```css
:root {
    --canada-accent: #1a365d; /* Custom accent color */
    --max-content-width: 1200px; /* Custom max width */
    --spacing-lg: 2rem; /* Custom spacing */
}
```

### Responsive Design

The stylesheet includes comprehensive responsive design:

```css
/* Mobile-first approach */
@media (max-width: 767px) {
    /* Mobile styles automatically applied */
}

@media (min-width: 768px) {
    /* Tablet and desktop styles */
}
```

### Accessibility Features

Built-in accessibility includes:
- WCAG AAA color contrast compliance
- Keyboard navigation support
- Screen reader optimization
- Focus indicators
- Skip links
- Reduced motion support

```html
<!-- Skip to main content -->
<a href="#main" class="canada-skip-link">Skip to main content</a>

<!-- Screen reader only text -->
<span class="canada-sr-only">Additional context for screen readers</span>
```

## Utility Classes

### Spacing

```html
<!-- Margins -->
<div class="canada-mb-lg">Large bottom margin</div>
<div class="canada-mt-md">Medium top margin</div>

<!-- Padding -->
<div class="canada-p-lg">Large padding all around</div>
```

### Text Alignment

```html
<p class="canada-text-center">Centered text</p>
<p class="canada-text-right">Right-aligned text</p>
```

### Visibility

```html
<div class="canada-hide-mobile">Hidden on mobile</div>
<div class="canada-show-mobile canada-hide-desktop">Mobile only</div>
```

## Integration Examples

### WordPress Integration

Add to your theme's `functions.php`:

```php
function enqueue_canada_styles() {
    wp_enqueue_style('canada-design', get_template_directory_uri() . '/css/canada-design-stylesheet.css');
}
add_action('wp_enqueue_scripts', 'enqueue_canada_styles');
```

### React Integration

```jsx
import './canada-design-stylesheet.css';

function App() {
    return (
        <div className="canada-container">
            <h1>React App with Canada.ca Design</h1>
            <button className="canada-btn canada-btn-primary">
                Get Started
            </button>
        </div>
    );
}
```

### Vue.js Integration

```vue
<template>
    <div class="canada-container">
        <h1>Vue App</h1>
        <div class="canada-grid canada-grid-2">
            <div class="canada-card" v-for="item in items" :key="item.id">
                <h3>{{ item.title }}</h3>
                <p>{{ item.description }}</p>
            </div>
        </div>
    </div>
</template>

<style>
@import './canada-design-stylesheet.css';
</style>
```

## Browser Support

The stylesheet supports:
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- Internet Explorer 11 (with polyfills)

## Performance Optimization

The stylesheet is optimized for performance:
- Minimal CSS file size (~15KB gzipped)
- Efficient CSS selectors
- Optimized font loading
- Print-friendly styles included
- No JavaScript dependencies

## Compliance and Standards

This stylesheet ensures compliance with:
- Canada.ca Design System specifications
- WCAG 2.1 AAA accessibility standards
- Government of Canada web standards
- Responsive design best practices
- Cross-browser compatibility requirements

## Troubleshooting

### Common Issues

**Typography not loading:**
- Ensure Google Fonts are accessible
- Check for font-display policies
- Verify network connectivity

**Colors not applying:**
- Check CSS specificity conflicts
- Ensure proper class names
- Verify CSS variable support

**Layout issues:**
- Confirm container classes are applied
- Check for conflicting CSS
- Verify responsive breakpoints

### Override Conflicts

If existing styles conflict:

```css
/* Increase specificity */
.canada-container.canada-container {
    max-width: var(--max-content-width);
}

/* Use !important sparingly */
.canada-btn-primary {
    background-color: var(--canada-accent) !important;
}
```

## Support and Updates

This stylesheet is based on the official Canada.ca design system and will be updated to reflect any changes to government standards. For the most current version and additional resources, refer to the official Canada.ca design documentation.

## License

This stylesheet is provided as open source software. You are free to use, modify, and distribute it in accordance with standard open source practices. The Canada.ca design system specifications are maintained by the Government of Canada.

---

*This documentation provides comprehensive guidance for implementing the Canada.ca design system on any website. The stylesheet ensures professional, accessible, and government-standard presentation while maintaining ease of use and flexibility.*

