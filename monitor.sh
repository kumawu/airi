#!/usr/bin/env bash
#
# 服务监控脚本 (Service Monitor Script)
#
# 功能说明：
#   - 监控后端服务的运行状态
#   - 自动检测服务异常并进行重启
#   - 记录监控和重启日志
#
# 运行环境要求：
#   - bash 环境
#   - curl 命令
#   - conda 环境（用于激活 airi 环境）
#   - pgrep 命令（用于进程管理）
#
# 使用方法：
#   直接运行脚本即可启动监控：
#   $ ./monitor.sh
#
# 监控行为：
#   - 每60秒检查一次服务状态
#   - 通过 HTTP 健康检查接口监控服务
#   - 发现异常时自动重启服务
#
# 日志文件：
#   位置：backend/logs/monitor.log
#   格式：[时间戳] 事件描述
#
# 环境变量：
#   USE_OLLAMA_DOCKER: 设置为 "true" 时会同时管理 ollama 进程
#


# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 输出函数
print_red() {
    echo -e "${RED}$1${NC}"
}

print_green() {
    echo -e "${GREEN}$1${NC}"
}

print_yellow() {
    echo -e "${YELLOW}$1${NC}"
}

# 获取脚本所在目录的绝对路径
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
BACKEND_DIR="$SCRIPT_DIR/backend"
LOG_FILE="$BACKEND_DIR/logs/monitor.log"

# 确保日志目录存在
mkdir -p "$BACKEND_DIR/logs"

# 记录日志的函数
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    echo "$1"
}

# 检查服务状态的函数
check_service() {
    if curl -s http://localhost:8080/health > /dev/null; then
        return 0
    else
        return 1
    fi
}

# 重启服务的函数
restart_service() {
    log_message "检测到服务异常，开始重启流程..."
    
    # 查找并终止现有的uvicorn进程
    PID=$(pgrep -f "uvicorn open_webui.main:app")
    if [ -n "$PID" ]; then
        log_message "终止现有服务进程 (PID: $PID)..."
        kill $PID
        sleep 2
        # 检查进程是否仍在运行
        if kill -0 $PID 2>/dev/null; then
            log_message "无法终止现有进程，请手动检查"
            return 1
        fi
    fi

    # 检查并终止ollama进程（如果USE_OLLAMA_DOCKER为true）
    if [[ "${USE_OLLAMA_DOCKER,,}" == "true" ]]; then
        OLLAMA_PID=$(pgrep -f "ollama serve")
        if [ -n "$OLLAMA_PID" ]; then
            log_message "终止ollama进程 (PID: $OLLAMA_PID)..."
            kill $OLLAMA_PID
            sleep 2
        fi
    fi

    # 激活conda环境
    log_message "激活conda环境..."
    source "$HOME/.bashrc"
    conda activate airi

    # 启动新的服务进程
    log_message "启动新的服务进程..."
    cd "$BACKEND_DIR" && ./start.sh > logs/backend.log 2>&1 &

    # 等待服务启动
    log_message "等待服务启动..."
    for i in {1..30}; do
        if check_service; then
            log_message "服务已成功重启"
            return 0
        fi
        sleep 1
    done

    log_message "服务启动失败，请检查日志文件"
    return 1
}

# 主循环
while true; do
    if ! check_service; then
        print_red "服务异常，开始重启流程"
        if restart_service; then
            print_green "服务已恢复正常运行"
        else
            print_red "服务重启失败，请查看日志文件: $LOG_FILE"
        fi
    fi
    sleep 60  # 每分钟检查一次
done