# Manuals Downloader Agent

A specialized VS Code Copilot agent for searching and retrieving product manuals from manuals.plus.

## Overview

The Manuals Downloader Agent automates the process of searching for appliance and device user manuals on [manuals.plus](https://manuals.plus), extracting PDF download links, and saving them to your local system.

## Features

✨ **Search Capabilities**
- Search manuals.plus by model number or device name
- Get instant results with 50+ documents per search
- Filter results to prioritize user manuals over technical specs

📥 **Download Management**
- Extract direct PDF download links
- Save files with descriptive filenames
- Organize downloads in your specified directory
- Verify file integrity after download

🎯 **Smart Filtering**
- Automatically identifies user manuals vs. technical specifications
- Handles multiple results with user confirmation
- Supports all appliance types (dryers, refrigerators, ovens, etc.)

## Installation

### For VS Code Users

1. Copy the agent file to your VS Code prompts folder:
   ```
   ~/.vscode/User/prompts/manuals-downloader.agent.md
   ```
   Or on Windows:
   ```
   %APPDATA%\Code\User\prompts\manuals-downloader.agent.md
   ```

2. Reload VS Code or restart the Copilot extension

3. The agent will appear in Copilot chat with the name "Manuals Downloader"

## Usage

### Quick Start

In VS Code Copilot chat, you can:

```
@Manuals Downloader Download the user manual for Samsung DVE50A8800V
```

Or simply ask:
```
Find the user guide for a Whirlpool refrigerator model WRF535SWHZ
```

### Parameters

The agent will ask you for:
- **Model Number**: The specific product/model code (e.g., DVE50A8800V)
- **Save Location**: Where to store the PDF (optional, defaults to Desktop/Repos)
- **Document Type**: User Manual (preferred) or Technical Specification

## Workflow

1. **Search** - Navigates to manuals.plus and searches for your model
2. **Review** - Shows available results and helps identify the correct manual
3. **Extract** - Retrieves the direct PDF download link
4. **Download** - Downloads and saves the file to your specified location
5. **Confirm** - Reports the full file path and file size

## Example

**Request:**
```
Download the manual for Samsung DVE50A8800V/A3 dryer
```

**Response:**
```
✓ Search Results Found: 53 documents
✓ Selected: Samsung DVE50A8800V 7.5 Cu. Ft. Smart Dial Gas Dryer User Manual
✓ Document Type: User Manual (68 pages, 1.18 MB)
✓ Download Link: https://manuals.plus/m/468a9af143da9be9bca12c5b268a5bddbcc1a0bbc74587357cc8f67c49b50bd0_optim.pdf
✓ Saved to: c:\Users\...\Desktop\Repos\Samsung_DVE50A8800V_UserManual.pdf
```

## Supported Document Types

- User Manuals
- Installation Guides
- Technical Specifications
- Warranty Documentation
- Quick Start Guides

## Technical Details

- **Source**: manuals.plus (free public manual library)
- **Language**: Agent-based automation with browser automation and terminal commands
- **Compatible**: Windows, macOS, Linux (via VS Code)
- **Requirements**: VS Code with Copilot extension

## Python API Example

If you want a standalone Python example for GitHub Models inference, use the script in [api_call_example.py](api_call_example.py).

Install the dependencies first:

```bash
pip install -r requirements.txt
```

Set your token as an environment variable named `GITHUB_PAT`, then run:

```bash
python api_call_example.py
```

## Limitations

- manuals.plus blocks some automated downloads (anti-bot protection)
- Alternative: Agent can provide download links for manual download
- Large PDFs (>10MB) may take longer to process

## Future Enhancements

- [ ] Batch download multiple manuals
- [ ] Search multiple manual websites
- [ ] Auto-organize by brand/category
- [ ] OCR integration for manual indexing
- [ ] Direct integration with appliance databases

## Contributing

Found a bug? Want to improve the agent? Feel free to submit issues and pull requests!

## License

MIT License - Free to use and modify

## Support

For issues or questions about manuals.plus content, visit [manuals.plus/about-us](https://manuals.plus/about-us)

---

**Created**: June 4, 2026  
**Version**: 1.0  
**Status**: Production Ready
