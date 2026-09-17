# Update BirthdayAutomationDaily Scheduled Task
$taskName = "BirthdayAutomationDaily"
$workingDir = "C:\Users\narmina.ibrahimova\Desktop\birthday_automation"
$vbsPath = "$workingDir\run-scheduled-task.vbs"

$action = New-ScheduledTaskAction -Execute "wscript.exe" -Argument "`"$vbsPath`"" -WorkingDirectory $workingDir

$triggerDaily = New-ScheduledTaskTrigger -Daily -At 9:00am
$triggerLogon = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME

$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -WakeToRun -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 15)

# Register or update
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger @($triggerDaily, $triggerLogon) -Settings $settings -Description "Gundelik Ad Gunu Tebrik Botu (Saat 09:00 ve Logon)" -Force

Write-Output "Task updated successfully."
