require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { PrismaClient } = require("./generated/prisma");
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Registration failed",
        error: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        name,
        email,
        password: hashedPassword,
        role: role || "CUSTOMER",
        cart: {
          create: {
            id: uuidv4(),
          },
        },
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: "User registration failed",
      error: error.message,
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400).json({ message: "Login failed", error: error.message });
  }
});

app.get("/api/me", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(user);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error fetching user", error: error.message });
  }
});

app.put("/api/users/:id", authenticateToken, async (req, res) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        email: req.body.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({
      message: "Error updating user",
      error: error.message,
    });
  }
});

app.put("/api/users/:id/password", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!(await bcrypt.compare(req.body.currentPassword, user.password))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);

    await prisma.user.update({
      where: { id: req.params.id },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(400).json({
      message: "Error changing password",
      error: error.message,
    });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const { search, minPrice, maxPrice, category } = req.query;

    const where = {
      AND: [],
    };

    if (search) {
      where.AND.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.lte = parseFloat(maxPrice);
      where.AND.push({ sellingPrice: priceFilter });
    }

    if (category) {
      where.AND.push({ category: { equals: category } });
    }

    const products = await prisma.product.findMany({
      where: where.AND.length > 0 ? where : {},
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching product", error: error.message });
  }
});

const isAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }
  next();
};

app.post(
  "/api/admin/products",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const product = await prisma.product.create({
        data: {
          id: uuidv4(),
          ...req.body,
          sellingPrice: req.body.discountPrice || req.body.originalPrice,
        },
      });
      res.status(201).json(product);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Error creating product", error: error.message });
    }
  }
);

app.post(
  "/api/admin/products/bulk",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const createdProducts = await prisma.$transaction(
        req.body.map((product) =>
          prisma.product.create({
            data: {
              id: uuidv4(),
              ...product,
              sellingPrice: product.discountPrice || product.originalPrice,
            },
          })
        )
      );
      res.status(201).json(createdProducts);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Error creating products", error: error.message });
    }
  }
);

app.put(
  "/api/admin/products/:id",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const product = await prisma.product.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json(product);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Error updating product", error: error.message });
    }
  }
);

app.delete(
  "/api/admin/products/:id",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      await prisma.product.delete({
        where: { id: req.params.id },
      });
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res
        .status(400)
        .json({ message: "Error deleting product", error: error.message });
    }
  }
);

app.get("/api/cart", authenticateToken, async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    res.json(cart);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching cart", error: error.message });
  }
});

app.post("/api/cart", authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cart: { userId: req.user.id },
        productId,
      },
    });

    let cartItem;
    if (existingCartItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          id: uuidv4(),
          cart: { connect: { userId: req.user.id } },
          product: { connect: { id: productId } },
          quantity,
        },
      });
    }

    res.status(201).json(cartItem);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error adding to cart", error: error.message });
  }
});

app.put("/api/cart/:id", authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItem = await prisma.cartItem.update({
      where: { id: req.params.id },
      data: { quantity },
    });
    res.json(cartItem);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating cart item", error: error.message });
  }
});

app.delete("/api/cart/:id", authenticateToken, async (req, res) => {
  try {
    await prisma.cartItem.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "Item removed from cart" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error removing item from cart", error: error.message });
  }
});

app.post("/api/orders", authenticateToken, async (req, res) => {
  try {
    const { paymentType } = req.body;

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = cart.items.reduce((total, item) => {
      return total + item.product.sellingPrice * item.quantity;
    }, 0);

    const order = await prisma.order.create({
      data: {
        id: uuidv4(),
        user: { connect: { id: req.user.id } },
        totalAmount,
        paymentType,
        items: {
          create: cart.items.map((item) => ({
            id: uuidv4(),
            product: { connect: { id: item.productId } },
            quantity: item.quantity,
            price: item.product.sellingPrice,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    res.status(201).json(order);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error placing order", error: error.message });
  }
});

app.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
});

app.get("/api/orders/:id", authenticateToken, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching order", error: error.message });
  }
});

app.get("/api/orders/:id/history", authenticateToken, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        statusHistory: {
          include: {
            changedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            changedAt: "desc",
          },
        },
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put(
  "/api/admin/orders/:id/status",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const { status } = req.body;
      const { id } = req.params;

      const order = await prisma.order.findUnique({
        where: { id },
      });

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const validTransitions = {
        PENDING: ["PROCESSING", "CANCELLED"],
        PROCESSING: ["SHIPPED", "CANCELLED"],
        SHIPPED: ["DELIVERED"],
        DELIVERED: [],
        CANCELLED: [],
      };

      if (!validTransitions[order.status].includes(status)) {
        return res.status(400).json({
          error: `Invalid status transition from ${order.status} to ${status}`,
        });
      }

      const updatedOrder = await prisma.$transaction([
        prisma.order.update({
          where: { id },
          data: { status },
        }),
        prisma.orderStatusHistory.create({
          data: {
            orderId: id,
            status,
            changedById: req.user.id,
          },
        }),
      ]);

      res.json(updatedOrder[0]);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

app.get("/api/admin/orders", authenticateToken, isAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
});

app.get("/api/admin/users", authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
