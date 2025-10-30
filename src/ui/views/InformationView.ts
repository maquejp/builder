/**
 * Information screen view component
 * Author: Jean-Philippe Maquestiaux
 * License: EUPL-1.2
 */

import blessed from "blessed";
import * as fs from "fs";
import * as path from "path";

export interface PackageInfo {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  repository?: {
    type: string;
    url: string;
  };
  homepage?: string;
  keywords?: string[];
}

export class InformationView {
  public static create(
    screen: blessed.Widgets.Screen,
    onClose: () => void
  ): void {
    // Read package.json
    const packageInfo = this.readPackageInfo();

    // Create overlay box
    const infoBox = blessed.box({
      parent: screen,
      top: "center",
      left: "center",
      width: "80%",
      height: "70%",
      padding: 1,
      border: {
        type: "line",
      },
      style: {
        fg: "white",
        bg: "blue",
        border: {
          fg: "yellow",
        },
      },
      tags: true,
      scrollable: true,
      alwaysScroll: true,
      keys: true,
      vi: true,
      input: true,
      keyable: true,
    });

    // Create content
    const content = this.buildInfoContent(packageInfo);
    infoBox.setContent(content);

    // Create close instruction
    const closeInfo = blessed.text({
      parent: infoBox,
      bottom: 1,
      left: "center",
      width: "shrink",
      height: 1,
      content: "Press Enter or Escape to close",
      style: {
        fg: "yellow",
        bg: "blue",
        bold: true,
      },
    });

    // Focus the box to enable scrolling
    infoBox.focus();

    // Handle close events
    infoBox.key(["enter", "escape"], () => {
      infoBox.destroy();
      closeInfo.destroy();
      onClose();
    });

    // Render
    screen.render();
  }

  private static readPackageInfo(): PackageInfo {
    try {
      const packagePath = path.join(process.cwd(), "package.json");
      const packageContent = fs.readFileSync(packagePath, "utf8");
      return JSON.parse(packageContent);
    } catch (error) {
      // Return default info if package.json can't be read
      return {
        name: "builder",
        version: "unknown",
        description: "Package information unavailable",
        author: "Jean-Philippe Maquestiaux",
        license: "EUPL-1.2",
      };
    }
  }

  private static buildInfoContent(packageInfo: PackageInfo): string {
    const keywords = packageInfo.keywords
      ? packageInfo.keywords.join(", ")
      : "None specified";

    return `{center}{bold}${packageInfo.name.toUpperCase()} - Application Information{/bold}{/center}

{bold}Name:{/bold} ${packageInfo.name}
{bold}Version:{/bold} ${packageInfo.version}
{bold}Description:{/bold}
${packageInfo.description}

{bold}Author:{/bold} ${packageInfo.author}
{bold}License:{/bold} ${packageInfo.license}

${
  packageInfo.repository
    ? `{bold}Repository:{/bold} ${packageInfo.repository.url}`
    : ""
}
${packageInfo.homepage ? `{bold}Homepage:{/bold} ${packageInfo.homepage}` : ""}

{bold}Keywords:{/bold}
${keywords}

{bold}Dependencies:{/bold}
- blessed (Terminal UI library)
- ts-node (TypeScript execution)
- typescript (TypeScript compiler)

{bold}About:{/bold}
This is a project builder tool that helps create structured applications 
with frontend, backend, and database components. It supports generating 
project scaffolding for Angular frontends, Node.js/Express backends, 
and SQL database schemas.

The tool uses a JSON-based project definition format to specify the 
structure and components of your application, making it easy to 
bootstrap new projects with consistent architecture.`;
  }
}
