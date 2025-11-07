# Folder Name Pattern

The folder name should follow the pattern:

One folder for the parent project, and subfolders for each module or component.

```text
parent-project/
  ├── database/
  ├── backend/
  ├── frontend/
```

- The database folder contains all database-related scripts and actions.
- The backend folder contains server-side code and APIs.
- The frontend folder contains client-side code and user interfaces.

This structure helps in organizing the project components clearly and allows for easier navigation and management of different parts of the application.

Each folder can have its own sub-structure based on the specific needs of that component, but maintaining a clear top-level structure is essential for project clarity.

Generally, the folder structure under the frontend is related to the framework being used (e.g., React, Angular, Vue), while the backend structure may depend on the server framework (e.g., Express, Django, Spring).

For example, in a project named `stackcraft`, the folder structure would look like:

```text
stackcraft/
  ├── database/
  │   ├── tables/
  │   ├── procedures/
  │   ├── views/
  ├── backend/
  ├── frontend/
```

This organization facilitates collaboration among team members, as each member can focus on their respective areas without confusion.
