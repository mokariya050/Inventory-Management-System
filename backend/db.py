import os
import pymysql
import pymysql.cursors


def get_connection():
    return pymysql.connect(
        host=os.environ.get('MYSQL_HOST', 'localhost'),
        port=int(os.environ.get('MYSQL_PORT', 3306)),
        user=os.environ.get('MYSQL_USER', 'root'),
        password=os.environ.get('MYSQL_PASSWORD', ''),
        database=os.environ.get('MYSQL_DB', 'inventory_db'),
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True,
    )
