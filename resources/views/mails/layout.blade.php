<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gigs &amp; Campaigns</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

    <!-- Outer wrapper -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;padding:40px 16px;">
        <tr>
            <td align="center">

                <!-- Card -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">

                    <!-- Header -->
                    <tr>
                        <td style="background-color:#CC5500;padding:32px 40px;text-align:center;">
                            <p style="margin:0;font-size:11px;font-weight:900;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,0.7);">GIGS &amp; CAMPAIGNS</p>
                            <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.6);letter-spacing:2px;font-weight:600;">SPREAD THE WORD</p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:40px 40px 32px;">
                            @yield('content')
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style="padding:0 40px;">
                            <hr style="border:none;border-top:1px solid #f3f4f6;margin:0;">
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding:24px 40px;text-align:center;">
                            <p style="margin:0 0 6px;font-size:11px;color:#9ca3af;">
                                &copy; {{ date('Y') }} Gigs &amp; Campaigns Technology. All rights reserved.
                            </p>
                            <p style="margin:0;font-size:11px;color:#d1d5db;">Lagos, Nigeria &nbsp;|&nbsp; info@gigsandcampaigns.com</p>
                            <p style="margin:10px 0 0;font-size:10px;color:#d1d5db;">This is an automated message. Please do not reply to this email.</p>
                        </td>
                    </tr>

                </table>
                <!-- /Card -->

            </td>
        </tr>
    </table>

</body>
</html>
