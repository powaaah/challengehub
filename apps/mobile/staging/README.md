# Separate mobile test deployment

This is a prepared deployment, not a published address. The user authorized a
separate test environment on 2026-11-04. Server access and the required current
Server Administration notes are not attached to this session. Do not guess the
existing Caddy layout, system users, Node binary, or DNS ownership.

## Release contents

Use a separate checkout of `feat/mobile-foundation-12`, never the production
checkout. Require Node 24. Run `npm ci --prefix apps/mobile`, then in `apps/mobile`
run `npx expo export --platform web --output-dir dist-web`. The runtime needs
`apps/mobile/dist-web`, `apps/mobile/staging`, `apps/mobile/preview`, `lib`,
`domain`, and `data` from the same commit. No root npm installation, Next server,
production DB migration, or root build/start command is required for this service.

## Installation once server access is connected

1. Read current `Server Administration/informationen.MD`, `TODOS.MD`, `LOG.MD`.
   Inspect Caddy topology, free ports, Node 24 path and a dedicated test hostname.
2. Install the separate release under `/opt/challengehub-mobile-test/releases/COMMIT`
   with `current` pointing to it. Create an unprivileged `challengehub-test` service
   user. Use a separate persistent directory `/var/lib/challengehub-mobile-test`.
3. Adapt `environment.example` to the actual test HTTPS origin and save it as
   `/etc/challengehub-mobile-test.env`. Install the adapted service example.
   Verify `ExecStart` points to Node 24. Start only the new test service.
4. Add a separate test hostname to the existing proxy, preserving every existing
   site block. The example assumes Caddy runs on the host. If Caddy is containerized,
   inspect its network first: container loopback is not host loopback. Do not expose
   port 8097 directly or broaden the listener as a shortcut.
5. The proxy must preserve the configured Host and OVERWRITE `X-Real-IP` with its
   direct client IP. The loopback-only backend rejects missing/invalid proxy headers.
   Do not trust arbitrary forwarded chains. Validate proxy configuration before an
   atomic reload, with backup of the prior configuration. Set DNS for only the new
   test hostname and confirm TLS. Never replace the existing website.
6. Verify `/healthz`, assets, catalogue, and two independent guests over real HTTPS.
   Check invitation, start, results, reload and service restart persistence. Verify
   the existing website still responds as before. Share the tested actual URL only.

The browser creates invitation links on its current HTTPS origin. The catalogue
proxy reads public challenge content; guest writes go only into this service's
separate SQLite database. No indexing, referrer disclosure, or request-body logging.
IP-based rate limits use only the trusted proxy header. This is a small test service,
not a scalable production launch. Guests/duels expire after 30 days; abandoned rows
are cleaned on new guest creation. Back up SQLite before updating the test release.

Guest credentials currently live in browser sessionStorage per tab. Tell testers to
keep that tab open; closing it can lose guest access. Browser restoration varies.
Health integrations and installed native applications are outside this deployment.

## Rollback

Stop only `challengehub-mobile-test`; remove only its test proxy block and validate/
reload the proxy. Preserve the test database for diagnosis. For a compatible code
rollback, repoint `current` to the previous test release and restart only this
service. Never roll back the production app or delete production data.
