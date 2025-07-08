# Bun Proxy

## Description

This project is a simple proxy server built using Bun and Hono. It allows you to forward HTTP requests to a specified target URL.

## Features

- Forwards requests to a target URL specified in the `Target-URL` header.
- Supports Basic Authentication.
- Includes a timeout mechanism for requests.
- Provides a `/ping` endpoint for health checks.
- Can be run locally using Bun or deployed using Docker.

## Prerequisites

- [Bun](https://bun.sh/) installed on your system.
- [Docker](https://www.docker.com/) (optional, for running with Docker).

## Getting Started

### Running Locally

1.  **Clone the repository:**
    ```sh
    git clone <repository-url>
    cd bun-proxy
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project or ensure the required environment variables are set in your shell. See the "Environment Variables" section for details.

    *Example `.env` file structure (refer to `stack.env.example` if available or create based on `stack.env`):*
    ```env
    # .env
    AUTH_USERNAME=your_username
    AUTH_PASSWORD=your_secret_password
    # Add other necessary variables like HOST_PORT if needed
    ```

4.  **Run the development server:**
    ```sh
    bun run dev
    ```
    The server will start, typically on `http://localhost:3000` (or the port specified by `HOST_PORT`).

### Running with Docker

1.  **Build the Docker image:**
    ```sh
    docker build -t bun-proxy .
    ```

2.  **Run the Docker container:**
    Make sure you have a `stack.env` file in the root of your project, or provide the environment variables directly.
    ```sh
    docker run -p 3000:3000 --env-file stack.env bun-proxy
    ```
    Or, to specify a different host port:
    ```sh
    docker run -p <your-desired-host-port>:3000 --env-file stack.env bun-proxy
    ```
    The proxy will be accessible on `http://localhost:<your-desired-host-port>` or `http://localhost:3000`.

    Alternatively, you can use `docker-compose`:
    ```sh
    # Ensure stack.env is configured
    docker-compose up -d
    ```
    To stop and remove the containers:
    ```sh
    docker-compose down
    ```

## Environment Variables

The application requires the following environment variables to be set:

*   **`AUTH_USERNAME`**: The username for Basic Authentication for the `/proxy` endpoint.
    *   *Example in `stack.env`*: `test`
*   **`AUTH_PASSWORD`**: The password for Basic Authentication for the `/proxy` endpoint.
    *   *Example in `stack.env`*: `test`

The following environment variables are used by supporting files (e.g., `docker-compose.yml`):

*   **`HOST_PORT`**: (Optional) The port on the host machine that will be mapped to the container's port 3000 when using `docker-compose`. If not set, `docker-compose` will default to port `3000`.
    *   *Example*: `HOST_PORT=8080` will make the proxy accessible at `http://localhost:8080`.

The application code itself (`src/index.ts`) uses Hono's logger, which might be configurable via environment variables if Hono's logger supports it, but it's not explicitly defined in `src/env.ts`. For the proxy functionality, only `AUTH_USERNAME` and `AUTH_PASSWORD` are directly parsed from `process.env` via `src/env.ts`.

You can create a `.env` file in the project root for local development (Bun will automatically load it) or ensure these variables are present in your shell environment. For Docker, `docker-compose.yml` is configured to use `stack.env`.

**Example `.env` or `stack.env` file:**
```env
AUTH_USERNAME=your_secure_username
AUTH_PASSWORD=your_strong_password
# HOST_PORT=3001 # Optional: for docker-compose if you want to change the host port
```

## API Endpoints

### `/ping`

*   **Method:** `GET`
*   **Description:** A health check endpoint.
*   **Response:**
    *   `200 OK`: with body `pong`

### `/proxy`

*   **Method:** `ALL` (supports `GET`, `POST`, `PUT`, `DELETE`, etc.)
*   **Description:** Forwards the incoming request to the URL specified in the `Target-URL` header.
*   **Authentication:** Basic Authentication is required. The username and password must match `AUTH_USERNAME` and `AUTH_PASSWORD`.
*   **Headers:**
    *   `Target-URL` (required): The full URL to which the request should be proxied (e.g., `https://api.example.com/data`).
*   **Request Body:** The request body will be forwarded to the target URL (not applicable for `GET` requests).
*   **Responses:**
    *   `200 OK` (or other status from target): If the request to the target URL is successful, the response from the target is returned.
    *   `400 Bad Request`: If the `Target-URL` header is missing or invalid.
    *   `401 Unauthorized`: If Basic Authentication fails.
    *   `500 Internal Server Error`: If there's an error reading the response body from the target or another proxy error occurs.
    *   `504 Gateway Timeout`: If the request to the target URL times out (currently 5 seconds).

### Example Usage with `curl`

Replace `your_username`, `your_secret_password`, `http://localhost:3000`, and `https://jsonplaceholder.typicode.com/todos/1` with your actual credentials, proxy address, and target URL.

```sh
curl --user "your_username:your_secret_password" \
     -H "Target-URL: https://jsonplaceholder.typicode.com/todos/1" \
     http://localhost:3000/proxy
```

To make a POST request:

```sh
curl --user "your_username:your_secret_password" \
     -X POST \
     -H "Content-Type: application/json" \
     -H "Target-URL: https://jsonplaceholder.typicode.com/posts" \
     -d '{"title": "foo", "body": "bar", "userId": 1}' \
     http://localhost:3000/proxy
```

## Development

### Formatting

This project uses Prettier for code formatting. To format the code:

```sh
bun run format
```

## Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Ensure your code is formatted (`bun run format`).
5.  Commit your changes (`git commit -m 'Add some feature'`).
6.  Push to the branch (`git push origin feature/your-feature-name`).
7.  Open a Pull Request.

---

*This README provides a comprehensive guide to understanding, setting up, and using the Bun Proxy project.*
