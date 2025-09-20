from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import razorpay


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#  Razorpay Test Keys
RAZORPAY_KEY_ID = "rzp_test_RJkBeE2eYR62GS" #will set it as env var later 
RAZORPAY_KEY_SECRET = "qOZwo1faLf0ZvTNjyOVNpZ0H"

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

@app.post("/create-order/")
def create_order(cart_total: int):
    # Amount must be in paise (₹100 = 10000)
    order = client.order.create({
        "amount": cart_total * 100,
        "currency": "INR",
        "payment_capture": 1
    })
    return {"order_id": order["id"], "amount": order["amount"], "currency": order["currency"]}
