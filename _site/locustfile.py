from locust import HttpUser, between, task


class User(HttpUser):
    wait_time = between(5, 15)
    
    @task
    def visit_all_site(self):
        self.client.get("/")
        self.client.get("/about/")
        self.client.get("/projects/")
