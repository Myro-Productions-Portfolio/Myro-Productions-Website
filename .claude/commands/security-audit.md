# Security Audit Command

Run a comprehensive pre-deployment security audit using the security template checklist.

## Usage

```
/security-audit [--format=checklist|report] [--scope=all|auth|input|access|crypto|headers|logging|infra|testing]
```

## Parameters

- `--format`: Output format (default: checklist)
  - `checklist`: Interactive checklist format
  - `report`: Detailed security report format
- `--scope`: Audit scope (default: all)
  - `all`: Complete security audit
  - `auth`: Authentication & Session Management only
  - `input`: Input Validation & Data Sanitization only
  - `access`: Access Control & Authorization only
  - `crypto`: Cryptography & Data Protection only
  - `headers`: HTTP Security Headers only
  - `logging`: Error Handling & Logging only
  - `infra`: Infrastructure & Configuration Security only
  - `testing`: Automated Security Testing only

## Examples

```bash
# Run complete security audit
/security-audit

# Run authentication-focused audit
/security-audit --scope=auth

# Generate detailed security report
/security-audit --format=report

# Quick input validation check
/security-audit --scope=input --format=checklist
```

## Description

This command provides a systematic approach to pre-deployment security validation using industry best practices and OWASP guidelines. It covers eight critical security domains:

1. **Authentication & Session Management** - User identity and session security
2. **Input Validation & Data Sanitization** - Injection attack prevention
3. **Access Control & Authorization** - Proper permission enforcement
4. **Cryptography & Data Protection** - Data encryption and secure transmission
5. **HTTP Security Headers** - Browser security feature utilization
6. **Error Handling & Logging** - Information disclosure prevention
7. **Infrastructure & Configuration Security** - Server and deployment hardening
8. **Automated Security Testing** - Continuous security validation

The command generates actionable checklists with specific validation criteria, code examples, and implementation guidance to ensure robust application security before production deployment.