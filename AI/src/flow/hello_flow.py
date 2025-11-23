"""
Simple test flow for Prefect
"""
from prefect import flow, task
from datetime import datetime
import time


@task(name="say_hello", retries=2)
def say_hello(name: str) -> str:
    """Task để chào hỏi"""
    print(f"Hello, {name}!")
    return f"Greeted {name}"


@task(name="get_current_time")
def get_current_time() -> str:
    """Task để lấy thời gian hiện tại"""
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"Current time: {current_time}")
    return current_time


@task(name="simulate_work")
def simulate_work(seconds: int = 3) -> str:
    """Task giả lập công việc mất thời gian"""
    print(f"Starting work... (will take {seconds} seconds)")
    time.sleep(seconds)
    print("Work completed!")
    return f"Worked for {seconds} seconds"


@flow(name="hello-hotel-flow", log_prints=True)
def hello_flow(name: str = "Hotel AI System"):
    """
    Flow đơn giản để test Prefect

    Args:
        name: Tên để chào hỏi
    """
    print(f"🚀 Starting Hello Flow!")

    # Task 1: Say hello
    greeting_result = say_hello(name)

    # Task 2: Get current time
    time_result = get_current_time()

    # Task 3: Simulate some work
    work_result = simulate_work(seconds=2)

    print(f"✅ Flow completed successfully!")

    return {
        "greeting": greeting_result,
        "time": time_result,
        "work": work_result,
        "status": "success"
    }


# Để test local (không qua Prefect)
if __name__ == "__main__":
    result = hello_flow(name="Test User")
    print(f"\n📊 Final result: {result}")
