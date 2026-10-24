
if (( $# < 2 )) then
    echo "usage $0 <NODE_ENV> <ADMIN_KEY>" >& 2
    exit 1
fi


NODE_ENV=$1
ADMIN_KEY=$2

if [[ $NODE_ENV == "production" ]]; then
    HEALTH="https://gip-dev-challenges.onrender.com/health"
else 
    HEALTH="http://localhost:8000/health"
fi

echo "Running Health Check"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 60 "$HEALTH")

if [[ $STATUS == "200" ]]; then
    echo "Services Healthy"
else
    echo "Health Check Failed (HTTP $STATUS)" >&2
    exit 1
fi

cd backend
NODE_ENV=$NODE_ENV ADMIN_KEY=$ADMIN_KEY pnpm test