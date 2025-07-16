# Panopto Video Script: BatchProt Application Demo & Tech Overview

**I. Introduction (0:00 - 0:45)**

*   **Hook:** "Hello everyone. Today I'm going to walk you through BatchProt, a web application designed to help researchers perform batch protein analysis."
*   **Problem:** "Traditionally, this type of analysis is done one protein at a time, but BatchProt brings it all into one seamless, web-based workflow."
*   **Agenda:** "In this video, I'll demonstrate the application's core features and outline the tools I used to build it."

**II. Application Walkthrough & Technology (0:45 - 4:30)**

*   **High-Level Architecture & Monorepo**
    *   _Action:_ Briefly show the folder structure in a code editor.
    *   _Discourse:_ "Before diving into the app itself, let's quickly look at the project structure. This is a full-stack serverless application managed as a monorepo using **pnpm workspaces** and **Turborepo**. This setup is great for organizing code, with separate packages for things like the UI (`design-system`), the database schema (`database`), and the API definition (`api`), all while sharing code and types seamlessly."

*   **Landing Page & User Authentication**
    *   _Action:_ Navigate to the landing page (sign in page).
    *   _Discourse:_ "Here's the landing page, which is actually just the sign in page. It's built with **Next.js**. User authentication is handled by a newer auth library called **better-auth**. You can sign in with GitHub or email and password. And, users are saved in an RDS PostgreSQL database that we are using Drizzle ORM to interface with."

*   **Job Submission & Frontend-Backend Communication**
    *   _Action:_ From the dashboard, paste FASTA data from `peanut_allergens.fasta` into the form and submit.
    *   _Discourse:_ "After logging in, the user can submit a new analysis job. This form uses UI components from **Shadcn/UI** and is styled with **Tailwind CSS**., and when submitted, it makes a call to our backend, which is **tRPC**, which essentially gives us a type-safe Node.js backend, which basically means that my frontend code knows exactly what the API expects and what it will return, catching potential errors at build time, not runtime."

*   **Backend Processing: A Hybrid Approach**
    *   _Action:_ While the job is "processing," explain what happens behind the scenes.
    *   _Discourse:_ "Submitting that form kicked off a hybrid backend process. The **tRPC** call first hits a **Node.js** serverless function running on AWS Lambda. This function, using **Drizzle ORM** for type-safe SQL queries, records the job in our **PostgreSQL** database. Then, for the heavy computational work, the system calls a separate **Python service** built with **FastAPI**. This service is optimized for performance and is perfect for running the scientific analysis on the protein data."

*   **Viewing Job Results**
    *   _Action:_ Navigate to the job details page for the completed job.
    *   _Discourse:_ "Once the analysis is complete, the results are stored in the database. This page fetches and displays the results. Again, this is a server-rendered page from **Next.js** that uses **tRPC** to query the backend for the job details. The data is then presented in a table, also a **Shadcn/UI** component."

*   **Infrastructure as Code & Deployment**
    *   _Action:_ Briefly mention how the application is deployed.
    *   _Discourse:_ "The entire infrastructure for this application—the Next.js app, the Node.js API, the Python service, and the RDS PostgreSQL database—is defined as code using **SST (Serverless Stack)**. SST makes it incredibly simple to configure, deploy, and manage all the necessary **AWS** resources from within the monorepo. For local development, as shown in the `README`, developers use **Docker** to run a local database, ensuring a consistent environment."

**III. Conclusion (4:30 - 5:00)**

*   **Recap:** "So, that's BatchProt. By combining a modern TypeScript stack with a powerful Python backend for analysis, all managed and deployed via SST, we get a scalable and maintainable application, hosted on AWS, that features the best from both the JavaScript and Python ecosystems."
*   **Closing:** "Thanks for watching!"
