import httpx
import logging
from open_webui.socket.main import sio
from open_webui.models.users import Users
from open_webui.env import (
    SRC_LOG_LEVELS,
)
log = logging.getLogger(__name__)
log.setLevel(SRC_LOG_LEVELS["MAIN"])

############################
# fetch_and_update_wallet_balance
############################

async def fetch_and_update_wallet_balance(user):
    try:
        async with httpx.AsyncClient() as client:
            # response = await client.get(
            #     f"http://44.207.149.57:8080/api/airie/account/balance?walletAddress=8DEr3vd9Nrnvpc9qZX3qoeevYTe8qtXbEZQpRwCTf7dC&top=5",
            #     timeout=10
            # )
            response = await client.get(
                f"http://44.207.149.57:8080/api/airie/account/balance?walletAddress={user.name}&top=5",
                timeout=10
            )

            log.info(f"WalletBalance API response: {response.text}")
            
            if response.status_code == 200:
                response_data = response.json()
                # 验证返回数据格式
                if not isinstance(response_data, dict) or 'data' not in response_data:
                    raise ValueError("Invalid wallet_balance data format: missing 'data' field")
                
                if 'walletBalance' not in response_data['data']:
                    raise ValueError("Invalid wallet_balance data format: missing 'walletBalance' field")
                
                wallet_balance_data = response_data['data']['walletBalance']

                # 验证必要的数据字段
                if 'balanceDesc' not in wallet_balance_data or 'totalValueUsd' not in wallet_balance_data:
                    raise ValueError("Invalid wallet_balance data: missing required fields 'balanceDesc' or 'totalValueUsd'")
                
                # 更新数据库
                Users.update_user_wallet_balance_by_id(user.id, wallet_balance_data)

                # 发送 socket.io 事件
                await sio.emit(
                    'wallet_balance_updated',
                    {"user_id": user.id, "wallet_balance": wallet_balance_data},
                    room=user.id
                )
            else:
                log.error(f"Dify API returned error: {response.status_code}, {response.text}")
    except ValueError as ve:
        log.error(f"wallet_balance data validation error: {str(ve)}")
    except Exception as e:
        log.error(f"Failed to fetch wallet_balance data: {str(e)}")
