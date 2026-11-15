import { test, expect } from '@playwright/test'

test('every guide opens and every step has readable instructions and an available image or text-only state', async ({ page }, info) => {
  test.setTimeout(180000)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/emergency/index.html')
  const guides = await page.evaluate(() => Object.entries(P).map(([id, p]) => ({ id, steps: p.s.map(stp) })))
  expect(guides.length).toBeGreaterThan(20)
  for (const guide of guides) {
    await page.evaluate(id => openGuide(id), guide.id)
    await expect(page.locator('#guide')).toBeVisible()
    for (let k = 0; k < guide.steps.length; k++) {
      const step = guide.steps[k]
      await expect(page.locator('#gdescription')).toHaveText(step.d)
      // Desktop shows the full instruction in the list; mobile uses the caption.
      const instruction = await page.locator('#gdescription').isVisible()
        ? page.locator('#gdescription') : page.locator('#gsteps li.on div span')
      await expect(instruction).toBeVisible()
      await expect(instruction).toBeInViewport()
      await expect(instruction).toHaveText(step.d)
      await expect(page.locator('#gcap span')).toHaveText(`STEP ${k+1} / ${guide.steps.length}`)
      if (step.img) {
        const image = page.locator('#gframe img')
        await expect(image).toHaveAttribute('src', step.img)
        await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true)
        await expect(image).toBeInViewport()
        await expect(image).toHaveAttribute('alt', step.t || `Step ${k+1}`)
      } else {
        await expect(page.locator('#gframe')).toContainText('TEXT-ONLY STEP')
      }
      expect(await page.locator('#gbox').evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true)
      if (k < guide.steps.length - 1) await page.getByRole('button', { name: 'Next step', exact: true }).click()
    }
    await expect(page.getByRole('button', { name: 'Next step', exact: true })).toBeDisabled()
    if (['ecg','eye'].includes(guide.id)) await page.screenshot({ path: info.outputPath(`${guide.id}-guide.png`) })
    await page.keyboard.press('Escape')
    await expect(page.locator('#guide')).not.toBeVisible()
  }
  expect(errors).toEqual([])
})

test('a failed guide image leaves instructions and navigation usable', async ({ page }) => {
  await page.route('**/img/eye%20exam/**', route => route.abort())
  await page.goto('/emergency/index.html')
  await page.evaluate(() => openGuide('eye'))
  await expect(page.locator('#gframe')).toContainText('IMAGE UNAVAILABLE')
  await expect(page.locator('#gdescription')).toContainText('Compare both eyes')
  await page.getByRole('button', { name: 'Next step', exact: true }).click()
  await expect(page.locator('#gdescription')).toContainText('Test vision separately')
  await page.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(page.locator('#guide')).not.toBeVisible()
})
