# Security Policy

We take the security of Freshcut 229 seriously. This document outlines how to report vulnerabilities and lists best security practices for maintaining the repository.

## Reporting a Vulnerability

If you find a security vulnerability, please do **not** open a public issue on GitHub. Instead, report it privately to our security team.

To report a vulnerability:
1. Send an email to [security@freshcut229.com](mailto:security@freshcut229.com).
2. Include a detailed description of the vulnerability, steps to reproduce it, and the potential impact.

We will acknowledge receipt of your report within 48 hours and work on releasing a fix as quickly as possible.

## Security Best Practices

*   **Environment Variables**: Never commit credentials, private API keys, or secrets (such as payment gateway merchant keys) to the repository. Store them in `.env.local` locally and configure them in your hosting provider's panel.
*   **Dependency Audits**: Run `npm audit` periodically to scan for vulnerable packages. Update vulnerabilities using `npm audit fix` or by updating the package version in `package.json`.
