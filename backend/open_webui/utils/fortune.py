import httpx
import datetime
from datetime import datetime as dt
import logging
from open_webui.socket.main import sio
from open_webui.models.users import Users
from open_webui.env import (
    SRC_LOG_LEVELS,
)
log = logging.getLogger(__name__)
log.setLevel(SRC_LOG_LEVELS["MAIN"])

############################
# GetSessionUser
############################

def format_timestamp(ts: int) -> str:
    return dt.fromtimestamp(ts, tz=datetime.timezone.utc).strftime('%Y-%m-%d %H:%M:%S')

async def fetch_and_update_fortune(user):
    try:
        api_key = 'app-IT5P34LjrBE9NUjbOnmUP4c3'
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        dify_request = {
            "inputs": {
                "language": "zh-CN",
                "birthday": format_timestamp(user.created_at),
                "sex": str(user.gender),
            },
            "response_mode": "blocking",
            "user": user.id
        }
        log.info(f"Fortune request data: {dify_request}")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://haf.api.weibo.com/v1/workflows/run",
                headers=headers,
                json=dify_request,
                timeout=None
            )
            log.info(f"Fortune API response: {response.text}")
            
            if response.status_code == 200:
                response_data = response.json()
                # 验证返回数据格式
                if not isinstance(response_data, dict) or 'data' not in response_data:
                    raise ValueError("Invalid fortune data format: missing 'data' field")
                
                if 'outputs' not in response_data['data']:
                    raise ValueError("Invalid fortune data format: missing 'outputs' field")
                
                fortune_data = response_data['data']['outputs']

                # 验证必要的数据字段
                if 'wu_xing_value' not in fortune_data or 'web_format_data' not in fortune_data:
                    raise ValueError("Invalid fortune data: missing required fields 'wu_xing_value' or 'web_format_data'")
                
                # 更新数据库
                Users.update_user_fortune_by_id(user.id, fortune_data)

                # 发送 socket.io 事件
                await sio.emit(
                    'fortune_updated',
                    {"user_id": user.id, "fortune": fortune_data},
                )
            else:
                log.error(f"Dify API returned error: {response.status_code}, {response.text}")
    except ValueError as ve:
        log.error(f"Fortune data validation error: {str(ve)}")
    except Exception as e:
        log.error(f"Failed to fetch fortune data: {str(e)}")
