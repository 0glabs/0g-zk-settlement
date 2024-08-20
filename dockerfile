# 基础镜像: 已安装 GCC 10
FROM debian:bullseye-slim

# 更新并安装必要的工具
RUN apt-get update && apt-get install -y \
    curl \
    gnupg2 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 安装 Rustup 并安装 Rust nightly
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
    && /root/.cargo/bin/rustup install nightly \
    && /root/.cargo/bin/rustup default nightly


# 添加 NodeSource 仓库
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# 安装 Node.js
RUN apt-get update 
RUN apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/

RUn npm install --global yarn 

# 确保 Cargo 和 Rust 编译器在 PATH 中
ENV PATH="/root/.cargo/bin:${PATH}"

# 设置工作目录
WORKDIR /app

# 复制项目文件
COPY . .

# 安装 Node.js 依赖并编译
RUN yarn install && \
    yarn compile && \
    yarn setup

# 编译 Rust-CPU
RUN cargo build --release
# 编译 Rust-GPU 
# RUN cargo build --release --features="cuda"

# 创建日志目录
RUN mkdir -p ./logs

# # 设置环境变量
ENV RUST_LOG=info

# 启动应用程序并重定向日志，同时确保容器持续运行
CMD nohup ./target/release/zk-settlement > logs/rust-prover.log 2>&1 & \
    nohup node js/server.js > logs/js-prover.log 2>&1 & \
    tail -f logs/rust-prover.log & \
    tail -f logs/js-prover.log

