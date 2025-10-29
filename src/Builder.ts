import { ProjectConfigurationManager } from "./config";

export class Builder {
  private configManager: ProjectConfigurationManager;
  private menuOptions: string[];
  constructor({
    appTitle,
    appSubTitle,
    appDescription,
    menuOptions,
    configManager,
  }: {
    appTitle: string;
    appSubTitle: string;
    appDescription: string;
    menuOptions: string[];
    configManager: ProjectConfigurationManager;
  }) {
    this.configManager = configManager;
    this.menuOptions = menuOptions;
    console.log(configManager);
    console.log(appTitle);
    console.log(appSubTitle);
    console.log(appDescription);
    console.log("Menu Options:");
    this.menuOptions.forEach((option, index) => {
      console.log(`${index + 1}. ${option}`);
    });
    // Further implementation would go here
  }
}
