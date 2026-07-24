import openpyxl

file_paths = [
    r'd:\oil adulteration new\smart_food_dish_management_data.xlsx',
    r'd:\oil adulteration new\Smart_Food_Management_Dish_Database-1.xlsx',
    r'd:\oil adulteration new\backend\smart_food_dish_management_data.xlsx'
]

# Quick sanity check of total max row
for p in file_paths:
    wb = openpyxl.load_workbook(p)
    print(p, 'Total rows:', wb['Dishes_Database'].max_row)
