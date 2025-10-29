/**
 * FileBrowser - TUI file browser for selecting JSON configuration files
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import * as blessed from "blessed";
import * as fs from "fs";
import * as path from "path";

export interface FileBrowserOptions {
  title?: string;
  startPath?: string;
  fileExtension?: string;
  filePattern?: string;
  excludedDirectories?: string[];
  onFileSelected: (filePath: string) => void;
  onCancel?: () => void;
}

/**
 * TUI File Browser component using Blessed
 */
export class FileBrowser {
  private screen: blessed.Widgets.Screen;
  private fileList!: blessed.Widgets.ListElement;
  private pathBox!: blessed.Widgets.BoxElement;
  private currentPath: string;
  private fileExtension: string;
  private filePattern: string;
  private excludedDirectories: string[];
  private onFileSelected: (filePath: string) => void;
  private onCancel: () => void;

  constructor(options: FileBrowserOptions) {
    this.currentPath = options.startPath || process.cwd();
    this.fileExtension = options.fileExtension || ".json";
    this.filePattern = options.filePattern || "definition.json";
    this.excludedDirectories = options.excludedDirectories || [
      ".git",
      "node_modules",
      "materials",
      "src",
      "dist",
    ];
    this.onFileSelected = options.onFileSelected;
    this.onCancel = options.onCancel || (() => process.exit(0));

    this.screen = blessed.screen({
      smartCSR: true,
      title: options.title || "File Browser",
    });

    this.setupUI();
    this.setupEventHandlers();
    this.refreshFileList();
  }

  /**
   * Setup the UI components
   */
  private setupUI(): void {
    // Header with current path
    this.pathBox = blessed.box({
      top: 0,
      left: 0,
      width: "100%",
      height: 3,
      content: `Current Path: ${this.currentPath}`,
      tags: true,
      border: {
        type: "line",
      },
      style: {
        fg: "white",
        bg: "blue",
        border: {
          fg: "#f0f0f0",
        },
      },
    });

    // File list
    this.fileList = blessed.list({
      label: ` {bold}{white-fg}Select a project definition file (*${this.filePattern}){/white-fg}{/bold} `,
      tags: true,
      top: 4,
      left: 0,
      width: "100%",
      height: "80%",
      keys: true,
      vi: true,
      mouse: true,
      border: "line",
      scrollbar: {
        ch: " ",
        track: {
          bg: "cyan",
        },
        style: {
          inverse: true,
        },
      },
      style: {
        fg: "white",
        bg: "black",
        border: {
          fg: "cyan",
        },
        selected: {
          bg: "blue",
          fg: "white",
        },
      },
    });

    // Instructions box
    const instructionsBox = blessed.box({
      bottom: 0,
      left: 0,
      width: "100%",
      height: 3,
      content:
        "{center}↑↓: Navigate | Enter: Select | Backspace: Go up | q/Esc: Cancel{/center}",
      tags: true,
      border: {
        type: "line",
      },
      style: {
        fg: "yellow",
        border: {
          fg: "yellow",
        },
      },
    });

    // Add all elements to screen
    this.screen.append(this.pathBox);
    this.screen.append(this.fileList);
    this.screen.append(instructionsBox);

    // Focus on the file list
    this.fileList.focus();
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Quit on Escape, q, or Control-C
    this.screen.key(["escape", "q", "C-c"], () => {
      this.screen.destroy();
      this.onCancel();
    });

    // Go up directory on backspace
    this.screen.key(["backspace"], () => {
      this.goUpDirectory();
    });

    // Handle selection
    this.fileList.key(["enter", "space"], () => {
      const selectedIndex = (this.fileList as any).selected;
      const items = (this.fileList as any).items;

      if (selectedIndex >= 0 && selectedIndex < items.length) {
        const selectedItem = items[selectedIndex].content;
        this.handleSelection(selectedItem);
      }
    });

    // Handle mouse clicks
    this.fileList.on("action", () => {
      const selectedIndex = (this.fileList as any).selected;
      const items = (this.fileList as any).items;

      if (selectedIndex >= 0 && selectedIndex < items.length) {
        const selectedItem = items[selectedIndex].content;
        this.handleSelection(selectedItem);
      }
    });
  }

  /**
   * Handle file/directory selection
   */
  private handleSelection(selectedItem: string): void {
    // Remove any blessed formatting tags
    const cleanItem = selectedItem.replace(/{[^}]*}/g, "");

    if (cleanItem === "..") {
      this.goUpDirectory();
      return;
    }

    const fullPath = path.join(this.currentPath, cleanItem);

    try {
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        this.currentPath = fullPath;
        this.refreshFileList();
      } else if (stats.isFile() && this.isValidJsonFile(cleanItem)) {
        this.screen.destroy();
        this.onFileSelected(fullPath);
      }
    } catch (error) {
      this.showError(`Error accessing ${fullPath}: ${error}`);
    }
  }

  /**
   * Go up one directory
   */
  private goUpDirectory(): void {
    const parentPath = path.dirname(this.currentPath);
    if (parentPath !== this.currentPath) {
      this.currentPath = parentPath;
      this.refreshFileList();
    }
  }

  /**
   * Refresh the file list based on current path
   */
  private refreshFileList(): void {
    try {
      const items = fs.readdirSync(this.currentPath);
      const fileItems: string[] = [];

      // Add parent directory option if not at root
      if (this.currentPath !== path.parse(this.currentPath).root) {
        fileItems.push("{cyan-fg}↑ ..{/cyan-fg}");
      }

      // Sort items: directories first, then files
      const directories: string[] = [];
      const files: string[] = [];

      items.forEach((item) => {
        const fullPath = path.join(this.currentPath, item);
        try {
          const stats = fs.statSync(fullPath);

          if (stats.isDirectory() && !this.isExcludedDirectory(item)) {
            directories.push(`{blue-fg}+ ${item}{/blue-fg}`);
          } else if (this.isValidJsonFile(item)) {
            files.push(`{green-fg}* ${item}{/green-fg}`);
          }
        } catch (error) {
          // Skip items we can't access
        }
      });

      // Add sorted items to the list
      fileItems.push(...directories.sort());
      fileItems.push(...files.sort());

      this.fileList.setItems(fileItems);
      this.updatePathDisplay();
      this.screen.render();
    } catch (error) {
      this.showError(`Error reading directory ${this.currentPath}: ${error}`);
    }
  }

  /**
   * Update the path display
   */
  private updatePathDisplay(): void {
    this.pathBox.setContent(
      `{center}{bold}Current Path:{/bold} {cyan-fg}${this.currentPath}{/cyan-fg}{/center}`
    );
  }

  /**
   * Show an error message
   */
  private showError(message: string): void {
    const errorBox = blessed.message({
      parent: this.screen,
      top: "center",
      left: "center",
      width: "60%",
      height: "shrink",
      label: " {red-fg}Error{/red-fg} ",
      tags: true,
      keys: true,
      hidden: true,
      border: "line",
      style: {
        fg: "white",
        bg: "black",
        border: {
          fg: "red",
        },
      },
    });

    errorBox.display(message, 0, () => {
      this.fileList.focus();
      this.screen.render();
    });
  }

  /**
   * Check if a file matches the specified pattern
   */
  private isValidJsonFile(fileName: string): boolean {
    const lowerFileName = fileName.toLowerCase();
    const hasJsonExtension = lowerFileName.endsWith(this.fileExtension);

    // Check if file matches the specified pattern
    const matchesPattern = lowerFileName.endsWith(
      this.filePattern.toLowerCase()
    );

    return hasJsonExtension && matchesPattern;
  }

  /**
   * Check if a directory should be excluded from the file browser
   */
  private isExcludedDirectory(dirName: string): boolean {
    return this.excludedDirectories.includes(dirName);
  }

  /**
   * Show the file browser
   */
  public show(): void {
    this.screen.render();
  }
}
