export
const Sync_job = (job, job_name) => {
  let executing = false
  return async () => {
    if (job_name)
      console.log('call sync job', job_name)
    if (executing) return
    if (job_name)
      console.log('execute sync job', job_name)
    executing = true

    const result = await await job()
    if (job_name)
      console.log('sync job finished', job_name)
    executing = false
    return result
  }
}
