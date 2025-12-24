<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f9fafb; padding-bottom: 40px; }
        .main { background-color: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; margin-top: 40px; }
        .header { background: linear-gradient(to right, #db2777, #16a34a); padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -1px; }
        .content { padding: 40px 30px; line-height: 1.6; color: #374151; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
        .button { display: inline-block; padding: 14px 30px; background-color: #db2777; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: bold; margin-top: 25px; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: bold; text-transform: uppercase; background: #fdf2f8; color: #db2777; }
    </style>
</head>
<body>
    <div className="wrapper">
        <div className="main">
            <div className="header">
                <h1>Gigs & Campaigns</h1>
            </div>
            <div className="content">
                @yield('content')
            </div>
        </div>
        <div className="footer">
            &copy; {{ date('Y') }} Gigs & Campaigns. All rights reserved. <br>
            Lagos, Nigeria.
        </div>
    </div>
</body>
</html>
