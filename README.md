# Tiffin Sathi - Subscription-Based Tiffin Service Platform

A web application that connects home chefs with customers through a subscription-based meal delivery model in Nepal.

## Overview

**Tiffin Sathi** digitalizes the traditional tiffin service sector by providing a centralized platform for:
- **Customers**: Browse, subscribe, and track meal orders
- **Vendors**: Create meal packages, manage orders, and view analytics
- **Admin**: Approve vendors and monitor system activities
- **Delivery Partners**: Track and deliver orders

## Tech Stack

**Frontend**: React.js, Tailwind CSS, Lucide React, Axios  
**Backend**: Java Spring Boot, Spring Security, Spring Data JPA  
**Database**: MySQL  
**Payments**: eSewa, Khalti  
**Storage**: Cloudinary  
**Email**: Gmail SMTP  
**Tools**: Git, Jira, Postman, Selenium

## Quick Start

### Frontend Setup
```bash
git clone https://github.com/your-repo/tiffin-sathi.git
cd tiffin-sathi/frontend
npm install
echo "REACT_APP_API_BASE=http://localhost:8080/api" > .env
npm start
```

### Backend Setup
```bash
cd tiffin-sathi/backend
mvn clean install
mvn spring-boot:run
```

### Database Setup
```bash
mysql -u root -p -e "CREATE DATABASE tiffin_sathi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Configure `application.properties` with database and API credentials.

## Features

### User Features
- Browse vendors and meal plans
- Subscribe to meals with customization
- Track orders in real-time
- Rate and review vendors

### Vendor Features
- Create and manage meal packages
- Process orders and assign delivery personnel
- View sales analytics and customer feedback
- Upload business documents (FSSAI, PAN)

### Admin Features
- Approve/manage vendors
- Monitor transactions and payments
- Handle disputes and refunds

### Delivery Features
- View assigned orders
- Update delivery status
- Real-time navigation support

## Project Structure

```
tiffin-sathi/
├── frontend/               # React.js application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── helpers/
│   └── package.json
├── backend/                # Spring Boot application
│   ├── src/main/java/
│   └── pom.xml
├── database/               # Database schema
└── docs/                   # Documentation
```

## Testing

```bash
# Backend unit tests
mvn test

# Frontend unit tests
npm test

# API testing with Postman
# Import postman_collection.json from docs/
```

## Team

| Name | Role |
|------|------|
| Pranish Raj Tuladhar | Full Stack & Team Lead |
| Amish Man Joshi | QA & Full-stack |
| Bishant Bramhasakha | Front-end Developer |
| Nihit Shahi | UI/UX & Front-end |

**Supervisor**: Mr. Chiranjibi Shrestha

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details

## Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Email**: Contact team for inquiries

---

**Version**: 1.0.0 | **Last Updated**: December 2024
