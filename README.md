# Website Focus Lock Chrome Extension

Website Focus Lock is a simple and elegant Chrome Extension designed to help you stay focused by temporarily locking access to distracting websites. Unlike traditional blockers that impose strict, inflexible timers, this extension offers a user-configurable timed unlock mechanism, allowing for a more natural and less frustrating transition back to unlocked browsing.

Whether you're an engineer deep in a complex problem, a student tackling coursework, or a developer pushing code, staying focused is crucial. Website Focus Lock provides the necessary guardrails without forcing you to wait through unnecessarily long block periods if you finish your work early.

## Features

*   **Instant Website Locking:** Lock the current website across all active tabs with a single click from the extension popup.
*   **Timed Unlock:** Initiate a configurable timed countdown (default 5 minutes) to unlock the website.
*   **Flexible Control:** No more waiting on rigid timers. Start the unlock when you're ready, allowing for a brief cool-down period.
*   **Clean and Intuitive UI:** User-friendly design in both the extension popup and the full-page lock overlay.
*   **Configurable Unlock Duration:** Easily adjust the unlock timer from the popup settings.
*   **State Persistence:** Lock and timer status are maintained across browser sessions and tab closures.
*   **Tab Synchronization:** Locking or starting the unlock on one tab affects all other open tabs for the same domain.

## Why Website Focus Lock?

Traditional blockers often penalize efficiency. If you set a 30-minute block and finish your task in 15, you're left with 15 minutes of enforced idleness before you can access the blocked site again. Website Focus Lock addresses this by providing a short, customizable cool-down timer. This encourages focused sprints while allowing for a quick and controlled return to the unlocked state when your work is done.

## Installation
You can install Website Focus Lock from the Chrome Web Store at this link:
( Pending Review )

To install Website Focus Lock from this repository:

1.  Download the repository as a ZIP file or clone it:
    ```bash
    git clone https://github.com/your-username/website-focus-lock.git
    ```
2.  Open Google Chrome and navigate to `chrome://extensions/`.
3.  Enable "Developer mode" using the toggle switch in the top right corner.
4.  Click the "Load unpacked" button in the top left corner.
5.  Navigate to the downloaded or cloned `website-focus-lock` directory and select it.

The extension should now be installed and visible in your Chrome extensions list and toolbar.

## Usage

1.  Navigate to the website you wish to temporarily lock.
2.  Click the Website Focus Lock extension icon in your Chrome toolbar.
3.  In the popup, the current website's domain will be displayed.
4.  Click the **"Lock This Website"** button. The website will now be locked across all open tabs with that domain.
5.  When you are ready to unlock the website, click the extension icon again.
6.  Click the **"Start Unlock Timer"** button. A countdown will begin.
7.  Once the timer reaches zero, the website will automatically unlock.

### Settings

In the extension popup, you can find a "Settings" section. Use the input field to change the default unlock duration in minutes. Click **"Save Settings"** to apply your changes for the current domain.

## Contributing

Contributions are welcome! If you have suggestions for improvements, find a bug, or would like to add new features, please feel free to open an issue or submit a pull request.

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature`).
3.  Make your changes and commit them (`git commit -m 'Add your feature'`).
4.  Push to the branch (`git push origin feature/your-feature`).
5.  Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
