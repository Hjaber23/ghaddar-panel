/* =====================================================================
   MOTORS & ACCESSORIES COMPANY - SAMPLE DATABASE SCRIPT
   Target: SQL Server Management Studio 22 / SQL Server 2019+
   =====================================================================
   Contents:
     1. Database creation
     2. Tables: Customers, Categories, Products, Invoices, InvoiceDetails
     3. Sample data: 50 customers, categories, products
     4. Randomly generated Invoices + InvoiceDetails (sales) for those customers
   ===================================================================== */

----------------------------------------------------------------------
-- 1. DATABASE
----------------------------------------------------------------------
IF DB_ID('MotorsCompanyDB') IS NULL
BEGIN
    CREATE DATABASE MotorsCompanyDB;
END
GO

USE MotorsCompanyDB;
GO

----------------------------------------------------------------------
-- 2. DROP TABLES IF THEY EXIST (clean re-run)
----------------------------------------------------------------------
IF OBJECT_ID('dbo.InvoiceDetails', 'U') IS NOT NULL DROP TABLE dbo.InvoiceDetails;
IF OBJECT_ID('dbo.Invoices', 'U') IS NOT NULL DROP TABLE dbo.Invoices;
IF OBJECT_ID('dbo.Products', 'U') IS NOT NULL DROP TABLE dbo.Products;
IF OBJECT_ID('dbo.Categories', 'U') IS NOT NULL DROP TABLE dbo.Categories;
IF OBJECT_ID('dbo.Customers', 'U') IS NOT NULL DROP TABLE dbo.Customers;
GO

----------------------------------------------------------------------
-- 3. TABLE: Customers
----------------------------------------------------------------------
CREATE TABLE dbo.Customers
(
    CustomerID      INT IDENTITY(1,1) PRIMARY KEY,
    FirstName       NVARCHAR(50)  NOT NULL,
    LastName        NVARCHAR(50)  NOT NULL,
    Phone           NVARCHAR(20)  NULL,
    Email           NVARCHAR(100) NULL,
    City            NVARCHAR(50)  NULL,
    Country         NVARCHAR(50)  NULL,
    RegisteredDate  DATE          NOT NULL DEFAULT (GETDATE())
);
GO

----------------------------------------------------------------------
-- 4. TABLE: Categories (Motors, Parts, Accessories, etc.)
----------------------------------------------------------------------
CREATE TABLE dbo.Categories
(
    CategoryID      INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName    NVARCHAR(50) NOT NULL
);
GO

----------------------------------------------------------------------
-- 5. TABLE: Products (Motors, Parts, Accessories)
----------------------------------------------------------------------
CREATE TABLE dbo.Products
(
    ProductID       INT IDENTITY(1,1) PRIMARY KEY,
    ProductName     NVARCHAR(100)   NOT NULL,
    CategoryID      INT             NOT NULL,
    UnitPrice       DECIMAL(10,2)   NOT NULL,
    StockQuantity   INT             NOT NULL DEFAULT (0),
    CONSTRAINT FK_Products_Categories FOREIGN KEY (CategoryID)
        REFERENCES dbo.Categories(CategoryID)
);
GO

----------------------------------------------------------------------
-- 6. TABLE: Invoices (one per sale transaction / header)
----------------------------------------------------------------------
CREATE TABLE dbo.Invoices
(
    InvoiceID       INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID      INT             NOT NULL,
    InvoiceDate     DATE            NOT NULL DEFAULT (GETDATE()),
    PaymentMethod   NVARCHAR(20)    NULL,   -- Cash, Card, Transfer
    TotalAmount     DECIMAL(12,2)   NOT NULL DEFAULT (0),
    CONSTRAINT FK_Invoices_Customers FOREIGN KEY (CustomerID)
        REFERENCES dbo.Customers(CustomerID)
);
GO

----------------------------------------------------------------------
-- 7. TABLE: InvoiceDetails (line items / sales detail)
----------------------------------------------------------------------
CREATE TABLE dbo.InvoiceDetails
(
    InvoiceDetailID INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceID       INT             NOT NULL,
    ProductID       INT             NOT NULL,
    Quantity        INT             NOT NULL,
    UnitPrice       DECIMAL(10,2)   NOT NULL,
    LineTotal       AS (Quantity * UnitPrice) PERSISTED,
    CONSTRAINT FK_InvoiceDetails_Invoices FOREIGN KEY (InvoiceID)
        REFERENCES dbo.Invoices(InvoiceID),
    CONSTRAINT FK_InvoiceDetails_Products FOREIGN KEY (ProductID)
        REFERENCES dbo.Products(ProductID)
);
GO

----------------------------------------------------------------------
-- 8. SAMPLE DATA: Categories
----------------------------------------------------------------------
INSERT INTO dbo.Categories (CategoryName)
VALUES ('Electric Motors'), ('Combustion Motors'), ('Motor Parts'),
       ('Accessories'), ('Tools'), ('Lubricants');
GO

----------------------------------------------------------------------
-- 9. SAMPLE DATA: Products
----------------------------------------------------------------------
INSERT INTO dbo.Products (ProductName, CategoryID, UnitPrice, StockQuantity)
VALUES
('AC Induction Motor 1HP', 1, 120.00, 50),
('DC Servo Motor 500W', 1, 210.50, 30),
('Diesel Engine 20HP', 2, 1500.00, 10),
('Gasoline Engine 15HP', 2, 1300.00, 12),
('Motor Bearing Set', 3, 15.75, 200),
('Piston Kit', 3, 45.00, 150),
('Carburetor', 3, 60.25, 80),
('Spark Plug', 3, 5.50, 500),
('Motor Belt', 4, 12.00, 300),
('Cooling Fan', 4, 22.30, 120),
('Motor Oil 5L', 6, 25.00, 400),
('Grease Tube', 6, 8.75, 250),
('Wrench Set', 5, 35.00, 60),
('Socket Set', 5, 40.00, 60),
('Motor Mount Bracket', 4, 18.90, 100);
GO

----------------------------------------------------------------------
-- 10. SAMPLE DATA: 50 Customers
----------------------------------------------------------------------
DECLARE @FirstNames TABLE (Name NVARCHAR(50));
DECLARE @LastNames  TABLE (Name NVARCHAR(50));
DECLARE @Cities     TABLE (Name NVARCHAR(50));

INSERT INTO @FirstNames VALUES
('Ahmad'),('Sara'),('Ali'),('Layla'),('Omar'),('Nour'),('Karim'),('Rana'),
('Hassan'),('Maya'),('Youssef'),('Dina'),('Fadi'),('Lea'),('Ziad'),('Rima'),
('Bassel'),('Salma'),('Tarek'),('Nadine'),('Marwan'),('Yasmin'),('Rami'),('Joudy'),
('Hadi');

INSERT INTO @LastNames VALUES
('Khalil'),('Haddad'),('Fares'),('Saad'),('Nassar'),('Aoun'),('Chami'),('Rizk'),
('Mansour'),('Abboud'),('Karam'),('Sleiman'),('Younes'),('Zaidan'),('Barakat'),
('Chehab'),('Farah'),('Ghanem'),('Kassem'),('Moussa'),('Nassif'),('Saleh'),
('Tannous'),('Wehbe'),('Yazbek');

INSERT INTO @Cities VALUES
('Beirut'),('Sidon'),('Tripoli'),('Tyre'),('Zahle'),('Byblos'),('Baalbek'),
('Nabatieh'),('Jounieh'),('Aley');

;WITH Numbers AS (
    SELECT TOP (50) ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS n
    FROM sys.all_objects
),
FN AS (
    SELECT Name, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS rn FROM @FirstNames
),
LN AS (
    SELECT Name, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS rn FROM @LastNames
),
CT AS (
    SELECT Name, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS rn FROM @Cities
)
INSERT INTO dbo.Customers (FirstName, LastName, Phone, Email, City, Country, RegisteredDate)
SELECT
    fn.Name AS FirstName,
    ln.Name AS LastName,
    '+961-70-' + RIGHT('000000' + CAST(ABS(CHECKSUM(NEWID())) % 999999 AS VARCHAR(6)), 6) AS Phone,
    LOWER(fn.Name + '.' + ln.Name + CAST(n.n AS VARCHAR(3)) + '@example.com') AS Email,
    ct.Name AS City,
    'Lebanon' AS Country,
    DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 720, GETDATE()) AS RegisteredDate
FROM Numbers n
JOIN FN fn ON fn.rn = ((n.n - 1) % 25) + 1
JOIN LN ln ON ln.rn = ((n.n * 3 - 1) % 25) + 1
JOIN CT ct ON ct.rn = ((n.n - 1) % 10) + 1;
GO

----------------------------------------------------------------------
-- 11. SAMPLE DATA: Invoices + InvoiceDetails (random sales per customer)
----------------------------------------------------------------------
DECLARE @CustomerID INT, @InvoiceID INT, @i INT, @NumInvoices INT;
DECLARE cust_cursor CURSOR FOR SELECT CustomerID FROM dbo.Customers;

OPEN cust_cursor;
FETCH NEXT FROM cust_cursor INTO @CustomerID;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @NumInvoices = (ABS(CHECKSUM(NEWID())) % 3) + 1;
    SET @i = 0;

    WHILE @i < @NumInvoices
    BEGIN
        INSERT INTO dbo.Invoices (CustomerID, InvoiceDate, PaymentMethod, TotalAmount)
        VALUES (
            @CustomerID,
            DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 365, GETDATE()),
            CASE (ABS(CHECKSUM(NEWID())) % 3)
                WHEN 0 THEN 'Cash'
                WHEN 1 THEN 'Card'
                ELSE 'Transfer'
            END,
            0
        );

        SET @InvoiceID = SCOPE_IDENTITY();

        INSERT INTO dbo.InvoiceDetails (InvoiceID, ProductID, Quantity, UnitPrice)
        SELECT TOP (1 + ABS(CHECKSUM(NEWID())) % 4)
            @InvoiceID,
            p.ProductID,
            1 + ABS(CHECKSUM(NEWID())) % 5,
            p.UnitPrice
        FROM dbo.Products p
        ORDER BY NEWID();

        UPDATE i
        SET i.TotalAmount = d.SumTotal
        FROM dbo.Invoices i
        JOIN (
            SELECT InvoiceID, SUM(LineTotal) AS SumTotal
            FROM dbo.InvoiceDetails
            WHERE InvoiceID = @InvoiceID
            GROUP BY InvoiceID
        ) d ON d.InvoiceID = i.InvoiceID;

        SET @i = @i + 1;
    END

    FETCH NEXT FROM cust_cursor INTO @CustomerID;
END

CLOSE cust_cursor;
DEALLOCATE cust_cursor;
GO
