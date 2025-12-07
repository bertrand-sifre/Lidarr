# syntax=docker/dockerfile:1

# Stage 1: Build Backend
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS backend-builder

# Copy Logo at root level first (required by build resources)
COPY Logo/ /Logo/

WORKDIR /src

# Copy solution and project files
COPY src/ ./

# Disable all code analyzers by modifying Directory.Build.props
RUN sed -i '/<\/Project>/i \  <PropertyGroup>\n    <EnforceCodeStyleInBuild>false</EnforceCodeStyleInBuild>\n    <EnableNETAnalyzers>false</EnableNETAnalyzers>\n    <RunAnalyzersDuringBuild>false</RunAnalyzersDuringBuild>\n    <TreatWarningsAsErrors>false</TreatWarningsAsErrors>\n    <WarningLevel>0</WarningLevel>\n  </PropertyGroup>' Directory.Build.props

# Restore and build for linux-musl-arm64 (compatible with ARM64 Docker)
RUN dotnet clean Lidarr.sln -c Debug && \
    dotnet msbuild -restore Lidarr.sln \
    -p:Configuration=Debug \
    -p:Platform=Posix \
    -p:RuntimeIdentifiers=linux-musl-arm64 \
    -p:SelfContained=true \
    -t:PublishAllRids

# Stage 2: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Enable corepack for yarn
RUN corepack enable && \
    yarn install --frozen-lockfile --network-timeout 120000

# Copy frontend source
COPY frontend/ ./frontend/
COPY tsconfig.json ./

# Build production frontend
RUN yarn run build --env production

# Stage 3: Runtime
FROM alpine:3.19

# Install runtime dependencies
RUN apk add --no-cache \
    ca-certificates \
    icu-libs \
    sqlite-libs \
    chromaprint \
    libintl \
    curl \
    mediainfo \
    su-exec \
    && addgroup -g 1000 lidarr \
    && adduser -u 1000 -G lidarr -h /config -D lidarr

# Set environment
ENV XDG_CONFIG_HOME="/config/xdg" \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false \
    LC_ALL=en_US.UTF-8 \
    LANG=en_US.UTF-8

WORKDIR /app

# Copy built backend from builder
COPY --from=backend-builder /_output/net8.0/linux-musl-arm64/publish/ ./

# Copy built frontend from builder (UI must be at /UI, one level up from /app)
COPY --from=frontend-builder /app/_output/UI/ /UI/

# Create necessary directories and set permissions
RUN mkdir -p /config /music /downloads && \
    chown -R lidarr:lidarr /app /UI /config /music /downloads

# Expose port
EXPOSE 8686

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8686/ping || exit 1

# Switch to non-root user
USER lidarr

VOLUME ["/config", "/music", "/downloads"]

# Run Lidarr
CMD ["/app/Lidarr", "-nobrowser", "-data=/config"]
