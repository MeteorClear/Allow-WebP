# Allow WebP Chrome Extension

## Overview
This extension allows you to insert WebP images in Google Docs. You just have to drag and drop WebP images you want to insert into the document.

## Features
- **Automatic Conversion**: Converts WebP images to PNG format when you drag and drop them into Google Docs.
- **Same Features**: The converted PNG images are inserted directly into your document at the drop location.
- **Efficient and Fast**: You no longer need to convert webp images to other formats.
- **Existing Insertion Method**: For webp insertion, simply drag and drop like the image insertion without any special method.

## How It Works
1. **Drag and Drop**: The extension intercepts the drop event, loads the mounted image file from the event.
2. **Automatic Conversion**: Converts the WebP image to PNG format image available in the document.
3. **New Insertion Event**: Creates a new drop event with the PNG file. The converted PNG image is inserted into your document at the exact location where you dropped the WebP image.

## Installation
- **Installation using the Chrome Web Store**
  1. Open the Webstore link to this extension 
    [https://chromewebstore.google.com/detail/allow-webp/bcdfbjbdmdcijfoombbllikkjlpmnikk](https://chromewebstore.google.com/detail/allow-webp/bcdfbjbdmdcijfoombbllikkjlpmnikk)
  2. Click "Add to Chrome"

- **Manual Installation**
  1. Clone this repository or download the extension package.
  2. Open Chrome and navigate to `chrome://extensions/`.
  3. Enable "Developer mode" at the top right corner.
  4. Click "Load unpacked" and select the folder containing the extension files.
  5. The Note Here extension icon will now appear in your toolbar for easy access.

## Usage
1. **Allow WebP in Google Docs**: Now WebP images can be inserted into Google Docs.
