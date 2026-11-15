import { test, expect } from '@playwright/test'

test('supplied logo and all 18 blood-draw step photos display correctly', async ({ page }, info) => {
  test.setTimeout(120000)
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  const logo = page.locator('.brand img.app-logo')
  await expect(logo).toHaveAttribute('alt', 'HEALium logo')
  await expect.poll(() => logo.evaluate((image) => image.naturalWidth)).toBeGreaterThan(0)
  await page.screenshot({ path: info.outputPath('dashboard-logo.png') })
  await page.getByRole('button', { name: 'Help — open emergency mode' }).click()
  const frame = page.frameLocator('iframe')
  const emergencyLogo = frame.locator('.logo img.app-logo')
  await expect.poll(() => emergencyLogo.evaluate((image) => image.naturalWidth)).toBeGreaterThan(0)
  await expect(emergencyLogo).toBeInViewport()
  // Reach the manual through the actual assessment and equipment UI.
  await frame.locator('[data-action="type"][data-v="other"]').click()
  await frame.locator('[data-action="item"][data-v="fatigue"]').click()
  await frame.locator('[data-action="grp"][data-g="dur"][data-v="today"]').click()
  await frame.locator('[data-action="grp"][data-g="sev"][data-v="mild"]').click()
  await frame.locator('#next').click()
  await frame.locator('[data-action="guide"][data-v="blood"]').first().click()
  await expect(frame.getByRole('heading', { name: 'Blood draw & analysis', exact: true })).toBeVisible()
  const names = ['01','02','03','04','05','06','07','07A','08','09','10','11','12','13','14','15','16','17']
  for (let step=0; step<names.length; step++) {
    const image = frame.locator('#gframe img')
    await expect(image).toHaveAttribute('src', `img/blood/${names[step]}.jpg`)
    await expect.poll(() => image.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true)
    await expect(image).toBeInViewport()
    await expect(frame.locator('#gcap span')).toHaveText(`STEP ${step+1} / 18`)
    await expect(image).toHaveAttribute('alt', await frame.locator('#gsteps li.on b').innerText())
    if (step===0 || step===7 || step===17) {
      await page.screenshot({ path: info.outputPath(`blood-step-${names[step]}.png`) })
    }
    if (step < names.length-1) await frame.getByRole('button', { name: 'Next step', exact: true }).click()
  }
  await expect(frame.getByRole('button', { name: 'Next step', exact: true })).toBeDisabled()
  await frame.getByRole('button', { name: 'Previous step', exact: true }).click()
  await expect(frame.locator('#gframe img')).toHaveAttribute('src', 'img/blood/16.jpg')
  await frame.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(frame.locator('#guide')).not.toBeVisible()
  expect(errors).toEqual([])
})
