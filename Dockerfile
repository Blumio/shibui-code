FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
ENV SHIBUI_SKIP_FRONTEND_BUILD=1

RUN apt-get update && apt-get install -y \
  ca-certificates curl git python3 python3-pip \
  build-essential cmake pkg-config \
  libgtk-3-dev libwebkit2gtk-4.1-dev xvfb \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get update && apt-get install -y nodejs \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . /app

RUN npm --prefix frontend install \
  && npm run build:frontend \
  && node cli/scripts/build-native.js --with-tests \
  && ctest --test-dir .native-build/$(node -p "process.platform + '-' + process.arch") --output-on-failure \
  && python3 -m pip install --break-system-packages pytest \
  && python3 -m pytest -q

RUN npm install -g /app

CMD ["bash"]
