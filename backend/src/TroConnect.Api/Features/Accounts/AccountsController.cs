using Microsoft.AspNetCore.Mvc;

namespace TroConnect.Api.Features.Accounts;

[ApiController]
[Route("api/accounts")]
public class AccountsController : ControllerBase
{
    private readonly AccountService _accountService;

    public AccountsController(AccountService accountService)
    {
        _accountService = accountService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var result = await _accountService.RegisterAsync(request);
        if (result is null)
        {
            return Conflict(new { message = "Email is already registered." });
        }

        return CreatedAtAction(nameof(Register), new { id = result.Id }, result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var result = await _accountService.LoginAsync(request);
        if (result is null)
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        return Ok(result);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request)
    {
        var rawToken = await _accountService.ForgotPasswordAsync(request);

        // Always the same response shape/status regardless of whether the email existed —
        // only the (dev-only) token field differs, since there's no real email delivery yet.
        return Ok(new ForgotPasswordResponse(
            "If an account with that email exists, a password reset token has been generated.",
            rawToken));
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request)
    {
        var success = await _accountService.ResetPasswordAsync(request);
        if (!success)
        {
            return BadRequest(new { message = "Invalid or expired reset token." });
        }

        return Ok(new ResetPasswordResponse("Password has been reset successfully."));
    }
}
