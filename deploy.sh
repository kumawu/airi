#!/usr/bin/env bash
#
# 项目部署脚本 (Project Deployment Script)
#
# 功能说明：
#   - 自动更新代码库（git pull）
#   - 构建前端资源（npm build）
#   - 重启后端服务（包括uvicorn和ollama）
#
# 运行环境要求：
#   - bash 环境
#   - git（用于代码更新）
#   - npm（用于前端构建）
#   - conda（用于激活airi环境）
#   - curl（用于健康检查）
#
# 参数说明：
#   -h, --help          显示帮助信息
#   --skip-build        跳过前端资源构建步骤
#   --skip-restart      跳过后端服务重启步骤
#
# 使用示例：
#   ./deploy.sh                 # 执行完整部署流程
#   ./deploy.sh --skip-build    # 仅更新代码和重启服务
#   ./deploy.sh --skip-restart  # 仅更新代码和构建前端
#
# 注意事项：
#   - 确保运行脚本前已安装所有必要的依赖
#   - 建议在执行部署前备份重要数据
#   - 如果服务启动失败，请查看日志文件
#   - USE_OLLAMA_DOCKER=true时会同时管理ollama进程
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

# 显示帮助信息
show_help() {
    echo "用法: $0 [选项]"
    echo "选项:"
    echo "  -h, --help          显示此帮助信息"
    echo "  --skip-build        跳过前端资源构建"
    echo "  --skip-restart      跳过后端服务重启"
    echo ""
    echo "示例:"
    echo "  $0                  执行完整部署流程"
    echo "  $0 --skip-build     仅更新代码和重启后端服务"
    echo "  $0 --skip-restart   仅更新代码和构建前端资源"
    exit 0
}

# 初始化参数
SKIP_BUILD=false
SKIP_RESTART=false

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-restart)
            SKIP_RESTART=true
            shift
            ;;
        *)
            echo "错误: 未知参数 $1"
            show_help
            ;;
    esac
done

# 获取脚本所在目录的绝对路径
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
BACKEND_DIR="$SCRIPT_DIR/backend"

# 切换到项目根目录
cd "$SCRIPT_DIR" || exit 1

# 更新代码
print_yellow "正在更新代码..."
git pull
if [ $? -ne 0 ]; then
    print_red "✗ 代码更新失败"
    exit 1
fi
print_green "✓ 代码更新完成"

# 根据参数决定是否构建前端资源
if [ "$SKIP_BUILD" = false ]; then
    print_yellow "正在构建前端资源..."
    export NODE_OPTIONS="--max-old-space-size=4096"
    npm run build
    if [ $? -ne 0 ]; then
        print_red "✗ 前端资源构建失败"
        exit 1
    fi
    print_green "✓ 前端资源构建完成"
else
    print_yellow "跳过前端资源构建"
fi

# 根据参数决定是否重启后端服务
if [ "$SKIP_RESTART" = false ]; then
    # 确保在backend目录下执行
    cd "$BACKEND_DIR" || exit 1

    # 创建日志目录
    mkdir -p logs

    # 查找并终止现有的uvicorn进程
    echo "正在检查现有的服务进程..."
    PID=$(pgrep -f "uvicorn open_webui.main:app")
    if [ -n "$PID" ]; then
        echo "发现运行中的服务进程 (PID: $PID)，正在终止..."
        kill $PID
        sleep 2
        # 检查进程是否仍在运行
        if kill -0 $PID 2>/dev/null; then
            print_red "✗ 无法终止现有进程，请手动检查"
            exit 1
        fi
        echo "已终止原有进程"
    fi

    # 检查并终止ollama进程（如果USE_OLLAMA_DOCKER为true）
    if [[ "$(echo "$USE_OLLAMA_DOCKER" | tr '[:upper:]' '[:lower:]')" == "true" ]]; then
        OLLAMA_PID=$(pgrep -f "ollama serve")
        if [ -n "$OLLAMA_PID" ]; then
            echo "发现运行中的ollama进程 (PID: $OLLAMA_PID)，正在终止..."
            kill $OLLAMA_PID
            sleep 2
        fi
    fi

    # 激活conda环境
    source "$HOME/.bashrc"
    conda activate airi

    # 启动新的服务进程
    echo "正在启动服务..."
    ./start.sh > logs/backend.log 2>&1 &

    # 等待服务启动
    echo "等待服务启动..."
    for i in {1..30}; do
        if curl -s http://localhost:8080/health > /dev/null; then
            print_green "✓ 后端服务已成功重启"
            print_green "日志文件位置: ./logs/backend.log"
            exit 0
        fi
        sleep 1
    done

    print_red "✗ 后端服务启动失败，请检查日志文件"
    exit 1
else
    print_yellow "跳过后端服务重启"
    exit 0
fi