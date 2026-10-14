# =====================================================================
#  Angular 22 app - multi-stage Docker build
#  Stage 1: build the app with Node   |   Stage 2: serve it with Nginx
#  Place this file in the project root (D:\New_project), next to package.json.
# =====================================================================

# ---------- Stage 1 : build ----------
# Angular 22 requires Node ^22.22.3 || ^24.15.0 || ^26.0.0 - Node 24 LTS is used here.
FROM node:24-alpine AS build
WORKDIR /app

# Install dependencies first (cached unless package files change)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the source and build for production
COPY . .
RUN npm run build -- --configuration production

# Angular 20+ writes to dist/<project-name>/browser; older builders write to dist/<project-name>.
# Collect whichever exists into /out so the next stage does not need the project name.
RUN mkdir -p /out \
 && if ls -d dist/*/browser >/dev/null 2>&1; then cp -r dist/*/browser/. /out/; \
    else cp -r dist/*/. /out/; fi

# ---------- Stage 2 : serve ----------
FROM nginx:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /out /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1
CMD ["nginx", "-g", "daemon off;"]