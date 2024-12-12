# CUSTOM FORM BACKEND

## To Run Locally
###
    Fork the Repository

```bash
git clone 
```

```bash
cd makeit-be
```
### Create Environment File
    PORT
    MONGO_URI
    ADMIN_PASSWOR 

### Download the required packages

```bash
npm install
```

### To run
```bash
npm run dev
```

# **API Documentation**
## **User Endpoints**
### **Create an Event**
- **EndPoint**   ` POST/api/create`
- **Request Body**
```json
{
    "password":"password",
    "name":"event-name",
    "description":"event-description",
    "date":"event-date",
    "fields": [
        {
            "name": "field-name",
            "placeholder": "placeholder",
            "type": "type",
            "required": "boolean"
        }
    ]
}
```
- **Response Body**
```json
{
    "message": "event created",
    "formurl":
    "http://${host}/api/register/{event_id}"
}
```

### **Register For Event**
- **EndPoint** `POST: http://${host}/api/register/{event_id}
`
- **Request Body**
```json
{
    "name": "User Name",
    "phone": "Mobile-number",
    "email": "email-id",
    "userData": {
        "field.name":"data"
    }
}
```

- **Response Body**
### **If New User**
```json
{
    "message":"User Submmitted Successfully"
}
```
### **If Already Existing User**
```json
{
    "message":"User added to the event"
}
```
### **Download Excel**
- **EndPoint** `POST /download`

### **Get All Users**
- **EndPoint** `GET /show`

- **Response Body**
```json
{
    "password":"password"
}
```

### **Update Attendance by ID**
- **Endpoint** `PUT /attendance/:eventId/:id`
- **Request Body**
```json
{
    "password":"password"
}
```
- **Response Body**
```json
{

}
```
### **Update All Attendance**
- **Endpoint** `PUT /attendance/:eventId`
- **Request Body**
```json
{
    "password":"password"
}
```
- **Response Body**
```json
{

}
```

### **Update User**
- **Endpoint** `PUT /edit/:id`
- **Request Body**
```json
{
    "password":"password"
}
```
- **Response Body**
```json
{

}
```

### **Get Event Form URL**
- **Endpoint** `GET /getformurl/:eventId`
- **Response Body**
```json
{
    "Registration form for the {event} is {url}"
}
```