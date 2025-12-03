from TaiwanLottery import TaiwanLotteryCrawler

lottery = TaiwanLotteryCrawler()
result = lottery.lotto649(['2025', '02'])
print(result)


# from TaiwanLottery import TaiwanLotteryCrawler
# from datetime import datetime, timedelta

# # 初始化 TaiwanLotteryCrawler
# lottery = TaiwanLotteryCrawler()

# # 設定開始日期和結束日期
# start_date = datetime(2020, 1, 1)
# end_date = datetime(2023, 6, 1)

# # 從開始日期逐月取得資料
# current_date = start_date

# while current_date <= end_date:
#     year = current_date.strftime('%Y')
#     month = current_date.strftime('%m')
    
#     # 爬取對應月份的大樂透資料
#     result = lottery.lotto649([year, month])
#     print(f"{year}-{month}: {result}")
    
#     # 將日期移動到下一個月
#     next_month = current_date + timedelta(days=31)
#     current_date = next_month.replace(day=1)
